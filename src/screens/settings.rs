use bevy::prelude::*;
use crate::state::{GameSettings, GameState};

pub struct SettingsScreenPlugin;

impl Plugin for SettingsScreenPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<GameSettings>()
            .add_systems(OnEnter(GameState::Settings), spawn_settings)
            .add_systems(OnExit(GameState::Settings), despawn_settings)
            .add_systems(Update, settings_button_system.run_if(in_state(GameState::Settings)));
    }
}

#[derive(Component)]
struct SettingsElement;

#[derive(Component)]
enum SettingsButton {
    Back,
    ToggleScientific,
    ToggleEffects,
}

fn spawn_settings(mut commands: Commands, settings: Res<GameSettings>) {
    commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Center,
                justify_content: JustifyContent::Center,
                row_gap: Val::Px(24.0),
                padding: UiRect::all(Val::Px(32.0)),
                ..default()
            },
            SettingsElement,
        ))
        .with_children(|parent| {
            parent.spawn((
                Text::new("Settings"),
                TextFont { font_size: 36.0, ..default() },
                TextColor(Color::WHITE),
            ));

            // Scientific mode toggle
            parent
                .spawn((
                    Button,
                    Node {
                        width: Val::Px(260.0),
                        height: Val::Px(52.0),
                        justify_content: JustifyContent::SpaceBetween,
                        align_items: AlignItems::Center,
                        padding: UiRect::axes(Val::Px(16.0), Val::Px(0.0)),
                        ..default()
                    },
                    BackgroundColor(Color::srgba(0.1, 0.1, 0.15, 0.8)),
                    BorderRadius::all(Val::Px(8.0)),
                    SettingsButton::ToggleScientific,
                ))
                .with_children(|btn| {
                    btn.spawn((
                        Text::new("Scientific Mode"),
                        TextFont { font_size: 14.0, ..default() },
                        TextColor(Color::WHITE),
                    ));
                    let on_color = if settings.scientific_mode {
                        Color::srgb(0.2, 0.8, 0.4)
                    } else {
                        Color::srgb(0.4, 0.4, 0.4)
                    };
                    btn.spawn((
                        Text::new(if settings.scientific_mode { "ON" } else { "OFF" }),
                        TextFont { font_size: 14.0, ..default() },
                        TextColor(on_color),
                    ));
                });

            // Particle effects toggle
            parent
                .spawn((
                    Button,
                    Node {
                        width: Val::Px(260.0),
                        height: Val::Px(52.0),
                        justify_content: JustifyContent::SpaceBetween,
                        align_items: AlignItems::Center,
                        padding: UiRect::axes(Val::Px(16.0), Val::Px(0.0)),
                        ..default()
                    },
                    BackgroundColor(Color::srgba(0.1, 0.1, 0.15, 0.8)),
                    BorderRadius::all(Val::Px(8.0)),
                    SettingsButton::ToggleEffects,
                ))
                .with_children(|btn| {
                    btn.spawn((
                        Text::new("Particle Effects"),
                        TextFont { font_size: 14.0, ..default() },
                        TextColor(Color::WHITE),
                    ));
                    let on_color = if settings.particle_effects {
                        Color::srgb(0.2, 0.8, 0.4)
                    } else {
                        Color::srgb(0.4, 0.4, 0.4)
                    };
                    btn.spawn((
                        Text::new(if settings.particle_effects { "ON" } else { "OFF" }),
                        TextFont { font_size: 14.0, ..default() },
                        TextColor(on_color),
                    ));
                });

            // Back button
            parent
                .spawn((
                    Button,
                    Node {
                        width: Val::Px(260.0),
                        height: Val::Px(52.0),
                        justify_content: JustifyContent::Center,
                        align_items: AlignItems::Center,
                        ..default()
                    },
                    BackgroundColor(Color::srgba(0.2, 0.2, 0.2, 0.5)),
                    BorderRadius::all(Val::Px(8.0)),
                    SettingsButton::Back,
                ))
                .with_children(|btn| {
                    btn.spawn((
                        Text::new("← Back"),
                        TextFont { font_size: 14.0, ..default() },
                        TextColor(Color::srgb(0.7, 0.7, 0.7)),
                    ));
                });
        });
}

fn settings_button_system(
    interaction_q: Query<(&Interaction, &SettingsButton), Changed<Interaction>>,
    mut next_state: ResMut<NextState<GameState>>,
    mut settings: ResMut<GameSettings>,
) {
    for (interaction, button) in interaction_q.iter() {
        if *interaction == Interaction::Pressed {
            match button {
                SettingsButton::Back => next_state.set(GameState::Home),
                SettingsButton::ToggleScientific => {
                    settings.scientific_mode = !settings.scientific_mode;
                }
                SettingsButton::ToggleEffects => {
                    settings.particle_effects = !settings.particle_effects;
                }
            }
        }
    }
}

fn despawn_settings(mut commands: Commands, q: Query<Entity, With<SettingsElement>>) {
    for e in q.iter() {
        commands.entity(e).despawn_recursive();
    }
}
