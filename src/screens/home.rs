use bevy::prelude::*;
use crate::state::GameState;

pub struct HomeScreenPlugin;

impl Plugin for HomeScreenPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(OnEnter(GameState::Home), spawn_home)
            .add_systems(OnExit(GameState::Home), despawn_home)
            .add_systems(Update, home_button_system.run_if(in_state(GameState::Home)));
    }
}

#[derive(Component)]
struct HomeElement;

#[derive(Component)]
enum HomeButton {
    Play,
    Settings,
}

fn spawn_home(mut commands: Commands) {
    commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                flex_direction: FlexDirection::Column,
                align_items: AlignItems::Center,
                justify_content: JustifyContent::Center,
                row_gap: Val::Px(40.0),
                ..default()
            },
            HomeElement,
        ))
        .with_children(|parent| {
            // Title block
            parent
                .spawn(Node {
                    flex_direction: FlexDirection::Column,
                    align_items: AlignItems::Center,
                    row_gap: Val::Px(8.0),
                    ..default()
                })
                .with_children(|title| {
                    title.spawn((
                        Text::new("PARTICLES"),
                        TextFont { font_size: 52.0, ..default() },
                        TextColor(Color::srgb(0.4, 0.85, 1.0)),
                    ));
                    title.spawn((
                        Text::new("Explore the Universe as a Hydrogen Atom"),
                        TextFont { font_size: 14.0, ..default() },
                        TextColor(Color::srgb(0.5, 0.5, 0.5)),
                    ));
                });

            // Buttons column
            parent
                .spawn(Node {
                    flex_direction: FlexDirection::Column,
                    align_items: AlignItems::Center,
                    row_gap: Val::Px(16.0),
                    width: Val::Px(240.0),
                    ..default()
                })
                .with_children(|btns| {
                    // Start Journey
                    btns.spawn((
                        Button,
                        Node {
                            width: Val::Percent(100.0),
                            height: Val::Px(56.0),
                            justify_content: JustifyContent::Center,
                            align_items: AlignItems::Center,
                            ..default()
                        },
                        BackgroundColor(Color::srgb(0.15, 0.35, 0.8)),
                        BorderRadius::all(Val::Px(8.0)),
                        HomeButton::Play,
                    ))
                    .with_children(|btn| {
                        btn.spawn((
                            Text::new("▶  Start Journey"),
                            TextFont { font_size: 16.0, ..default() },
                            TextColor(Color::WHITE),
                        ));
                    });

                    // Settings
                    btns.spawn((
                        Button,
                        Node {
                            width: Val::Percent(100.0),
                            height: Val::Px(48.0),
                            justify_content: JustifyContent::Center,
                            align_items: AlignItems::Center,
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        BackgroundColor(Color::srgba(0.1, 0.1, 0.1, 0.5)),
                        BorderColor(Color::srgba(0.4, 0.4, 0.4, 0.5)),
                        BorderRadius::all(Val::Px(8.0)),
                        HomeButton::Settings,
                    ))
                    .with_children(|btn| {
                        btn.spawn((
                            Text::new("⚙  Settings"),
                            TextFont { font_size: 14.0, ..default() },
                            TextColor(Color::srgb(0.7, 0.7, 0.7)),
                        ));
                    });
                });
        });
}

fn home_button_system(
    interaction_q: Query<(&Interaction, &HomeButton), Changed<Interaction>>,
    mut next_state: ResMut<NextState<GameState>>,
) {
    for (interaction, button) in interaction_q.iter() {
        if *interaction == Interaction::Pressed {
            match button {
                HomeButton::Play => next_state.set(GameState::Gameplay),
                HomeButton::Settings => next_state.set(GameState::Settings),
            }
        }
    }
}

fn despawn_home(mut commands: Commands, q: Query<Entity, With<HomeElement>>) {
    for e in q.iter() {
        commands.entity(e).despawn_recursive();
    }
}
