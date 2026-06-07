mod atoms;
mod bonding;
mod drag;
mod hud;
mod starfield;
mod state;
mod screens;

use bevy::prelude::*;
use state::GameState;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "PARTICLES".into(),
                resolution: (390., 844.).into(),
                resizable: true,
                ..default()
            }),
            ..default()
        }))
        .init_state::<GameState>()
        .add_plugins((
            starfield::StarfieldPlugin,
            atoms::AtomsPlugin,
            bonding::BondingPlugin,
            drag::DragPlugin,
            hud::HudPlugin,
            screens::ScreensPlugin,
        ))
        .add_systems(Startup, setup_camera)
        .run();
}

fn setup_camera(mut commands: Commands) {
    commands.spawn(Camera2d);
}
