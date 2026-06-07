use bevy::prelude::*;
use bevy::window::PrimaryWindow;
use crate::atoms::{Atom, Molecule};
use crate::state::{GameState, GameStats};

pub struct DragPlugin;

impl Plugin for DragPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<DragState>()
            .add_systems(
                Update,
                (start_drag, update_drag, end_drag)
                    .chain()
                    .run_if(in_state(GameState::Gameplay)),
            );
    }
}

#[derive(Resource, Default)]
pub struct DragState {
    pub dragged: Option<Entity>,
    pub offset: Vec2,
    pub is_dragging: bool,
}

const ATOM_RADIUS: f32 = 24.0;

fn cursor_world_pos(
    window: &Window,
    camera: &Camera,
    cam_transform: &GlobalTransform,
) -> Option<Vec2> {
    let cursor = window.cursor_position()?;
    camera.viewport_to_world_2d(cam_transform, cursor).ok()
}

fn start_drag(
    mouse: Res<ButtonInput<MouseButton>>,
    touches: Res<Touches>,
    window_q: Query<&Window, With<PrimaryWindow>>,
    camera_q: Query<(&Camera, &GlobalTransform)>,
    atom_q: Query<(Entity, &Transform), Or<(With<Atom>, With<Molecule>)>>,
    mut drag_state: ResMut<DragState>,
) {
    if drag_state.dragged.is_some() {
        return;
    }

    let pressed = mouse.just_pressed(MouseButton::Left) || touches.iter_just_pressed().next().is_some();
    if !pressed {
        return;
    }

    let Ok(window) = window_q.get_single() else { return };
    let Ok((camera, cam_transform)) = camera_q.get_single() else { return };

    let world_pos = if let Some(pos) = cursor_world_pos(window, camera, cam_transform) {
        pos
    } else if let Some(touch) = touches.iter_just_pressed().next() {
        let touch_screen = touch.position();
        let touch_screen = Vec2::new(touch_screen.x, touch_screen.y);
        match camera.viewport_to_world_2d(cam_transform, touch_screen) {
            Ok(p) => p,
            Err(_) => return,
        }
    } else {
        return;
    };

    // Find nearest atom within grab radius
    let mut best: Option<(Entity, f32)> = None;
    for (entity, transform) in atom_q.iter() {
        let dist = (transform.translation.truncate() - world_pos).length();
        if dist < ATOM_RADIUS * 1.5 {
            if best.map_or(true, |(_, d)| dist < d) {
                best = Some((entity, dist));
            }
        }
    }

    if let Some((entity, _)) = best {
        let transform = atom_q.get(entity).unwrap().1;
        drag_state.dragged = Some(entity);
        drag_state.offset = transform.translation.truncate() - world_pos;
        drag_state.is_dragging = true;
    }
}

fn update_drag(
    mouse: Res<ButtonInput<MouseButton>>,
    touches: Res<Touches>,
    window_q: Query<&Window, With<PrimaryWindow>>,
    camera_q: Query<(&Camera, &GlobalTransform)>,
    mut transform_q: Query<&mut Transform>,
    drag_state: Res<DragState>,
    mut stats: ResMut<GameStats>,
) {
    let Some(entity) = drag_state.dragged else { return };
    if !mouse.pressed(MouseButton::Left) && touches.iter().next().is_none() {
        return;
    }

    let Ok(window) = window_q.get_single() else { return };
    let Ok((camera, cam_transform)) = camera_q.get_single() else { return };

    let world_pos = if let Some(pos) = cursor_world_pos(window, camera, cam_transform) {
        pos
    } else if let Some(touch) = touches.iter().next() {
        let tp = touch.position();
        match camera.viewport_to_world_2d(cam_transform, Vec2::new(tp.x, tp.y)) {
            Ok(p) => p,
            Err(_) => return,
        }
    } else {
        return;
    };

    if let Ok(mut transform) = transform_q.get_mut(entity) {
        let new_pos = world_pos + drag_state.offset;
        transform.translation.x = new_pos.x;
        transform.translation.y = new_pos.y;
    }

    stats.energy = (stats.energy + 0.5).min(100.0);
}

fn end_drag(
    mouse: Res<ButtonInput<MouseButton>>,
    touches: Res<Touches>,
    mut drag_state: ResMut<DragState>,
) {
    if mouse.just_released(MouseButton::Left) || touches.iter_just_released().next().is_some() {
        drag_state.dragged = None;
        drag_state.is_dragging = false;
    }
}
