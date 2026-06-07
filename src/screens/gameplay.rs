use bevy::prelude::*;
use crate::state::GameState;

pub struct GameplayScreenPlugin;

impl Plugin for GameplayScreenPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(
            Update,
            back_to_home_button.run_if(in_state(GameState::Gameplay)),
        );
    }
}

#[derive(Component)]
struct BackHomeButton;

fn back_to_home_button(
    interaction_q: Query<&Interaction, (Changed<Interaction>, With<Button>)>,
    mut next_state: ResMut<NextState<GameState>>,
    keyboard: Res<ButtonInput<KeyCode>>,
) {
    if keyboard.just_pressed(KeyCode::Escape) {
        next_state.set(GameState::Home);
    }
}
