use bevy::prelude::*;
use crate::state::{GameState, GameStats};

pub struct HudPlugin;

impl Plugin for HudPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<GameStats>()
            .add_systems(OnEnter(GameState::Gameplay), spawn_hud)
            .add_systems(OnExit(GameState::Gameplay), despawn_hud)
            .add_systems(
                Update,
                (update_energy_bar, update_molecule_count, update_recent_molecule, tick_recent_molecule)
                    .run_if(in_state(GameState::Gameplay)),
            );
    }
}

#[derive(Component)]
struct HudElement;

#[derive(Component)]
struct EnergyBar;

#[derive(Component)]
struct MoleculeCountText;

#[derive(Component)]
struct RecentMoleculeNotification;

#[derive(Component)]
struct BondingTipText;

fn spawn_hud(mut commands: Commands) {
    // Root HUD node
    commands
        .spawn((
            Node {
                width: Val::Percent(100.0),
                height: Val::Percent(100.0),
                flex_direction: FlexDirection::Column,
                justify_content: JustifyContent::SpaceBetween,
                padding: UiRect::all(Val::Px(16.0)),
                ..default()
            },
            HudElement,
        ))
        .with_children(|parent| {
            // Top row
            parent
                .spawn(Node {
                    flex_direction: FlexDirection::Row,
                    justify_content: JustifyContent::SpaceBetween,
                    align_items: AlignItems::FlexStart,
                    ..default()
                })
                .with_children(|row| {
                    // Energy panel
                    row.spawn((
                        Node {
                            padding: UiRect::all(Val::Px(12.0)),
                            flex_direction: FlexDirection::Column,
                            ..default()
                        },
                        BackgroundColor(Color::srgba(0.0, 0.0, 0.0, 0.5)),
                        BorderRadius::all(Val::Px(8.0)),
                    ))
                    .with_children(|panel| {
                        panel.spawn((
                            Text::new("Energy"),
                            TextFont { font_size: 12.0, ..default() },
                            TextColor(Color::srgb(0.67, 0.93, 1.0)),
                        ));
                        panel
                            .spawn(Node {
                                flex_direction: FlexDirection::Row,
                                align_items: AlignItems::Center,
                                column_gap: Val::Px(8.0),
                                ..default()
                            })
                            .with_children(|row| {
                                row.spawn((
                                    Text::new("87%"),
                                    TextFont { font_size: 18.0, ..default() },
                                    TextColor(Color::WHITE),
                                    EnergyBar,
                                ));
                                // Bar track
                                row.spawn((
                                    Node {
                                        width: Val::Px(64.0),
                                        height: Val::Px(8.0),
                                        ..default()
                                    },
                                    BackgroundColor(Color::srgb(0.2, 0.2, 0.2)),
                                    BorderRadius::all(Val::Px(4.0)),
                                ));
                            });
                    });

                    // Molecule count panel
                    row.spawn((
                        Node {
                            padding: UiRect::all(Val::Px(12.0)),
                            flex_direction: FlexDirection::Column,
                            ..default()
                        },
                        BackgroundColor(Color::srgba(0.0, 0.0, 0.0, 0.5)),
                        BorderRadius::all(Val::Px(8.0)),
                    ))
                    .with_children(|panel| {
                        panel.spawn((
                            Text::new("Molecules"),
                            TextFont { font_size: 12.0, ..default() },
                            TextColor(Color::srgb(0.8, 0.6, 1.0)),
                        ));
                        panel.spawn((
                            Text::new("0"),
                            TextFont { font_size: 18.0, ..default() },
                            TextColor(Color::WHITE),
                            MoleculeCountText,
                        ));
                    });
                });

            // Center: recent molecule notification (hidden by default via alpha)
            parent.spawn((
                Node {
                    align_self: AlignSelf::Center,
                    padding: UiRect::all(Val::Px(16.0)),
                    flex_direction: FlexDirection::Row,
                    align_items: AlignItems::Center,
                    column_gap: Val::Px(12.0),
                    ..default()
                },
                BackgroundColor(Color::srgba(0.3, 0.25, 0.0, 0.0)),
                BorderRadius::all(Val::Px(8.0)),
                RecentMoleculeNotification,
            ))
            .with_children(|n| {
                n.spawn((
                    Text::new(""),
                    TextFont { font_size: 16.0, ..default() },
                    TextColor(Color::srgb(1.0, 0.9, 0.3)),
                    RecentMoleculeNotification,
                ));
            });

            // Bottom row
            parent
                .spawn(Node {
                    flex_direction: FlexDirection::Row,
                    justify_content: JustifyContent::SpaceBetween,
                    align_items: AlignItems::FlexEnd,
                    ..default()
                })
                .with_children(|row| {
                    // Home button
                    row.spawn((
                        Button,
                        Node {
                            width: Val::Px(48.0),
                            height: Val::Px(48.0),
                            justify_content: JustifyContent::Center,
                            align_items: AlignItems::Center,
                            ..default()
                        },
                        BackgroundColor(Color::srgba(0.0, 0.0, 0.0, 0.5)),
                        BorderRadius::all(Val::Px(8.0)),
                    ))
                    .with_children(|btn| {
                        btn.spawn((
                            Text::new("⌂"),
                            TextFont { font_size: 20.0, ..default() },
                            TextColor(Color::srgb(0.8, 0.8, 0.8)),
                        ));
                    });

                    // Bonding tip
                    row.spawn((
                        Node {
                            padding: UiRect::all(Val::Px(10.0)),
                            max_width: Val::Px(200.0),
                            ..default()
                        },
                        BackgroundColor(Color::srgba(0.0, 0.0, 0.0, 0.5)),
                        BorderRadius::all(Val::Px(8.0)),
                    ))
                    .with_children(|panel| {
                        panel.spawn((
                            Text::new("Drag atoms together to form bonds!"),
                            TextFont { font_size: 11.0, ..default() },
                            TextColor(Color::srgb(0.6, 0.8, 1.0)),
                            BondingTipText,
                        ));
                    });
                });
        });
}

fn update_energy_bar(stats: Res<GameStats>, mut q: Query<&mut Text, With<EnergyBar>>) {
    if !stats.is_changed() {
        return;
    }
    for mut text in q.iter_mut() {
        **text = format!("{:.0}%", stats.energy);
    }
}

fn update_molecule_count(stats: Res<GameStats>, mut q: Query<&mut Text, With<MoleculeCountText>>) {
    if !stats.is_changed() {
        return;
    }
    for mut text in q.iter_mut() {
        **text = stats.molecules_formed.to_string();
    }
}

fn update_recent_molecule(
    stats: Res<GameStats>,
    mut q: Query<(&mut Text, &mut TextColor), With<RecentMoleculeNotification>>,
) {
    if !stats.is_changed() {
        return;
    }
    for (mut text, mut color) in q.iter_mut() {
        if let Some((name, formula, remaining)) = &stats.recent_molecule {
            **text = format!("⚛ {}  {}", formula, name);
            let alpha = (*remaining / 3.0).min(1.0);
            color.0 = Color::srgba(1.0, 0.9, 0.3, alpha);
        } else {
            **text = String::new();
            color.0 = Color::srgba(1.0, 0.9, 0.3, 0.0);
        }
    }
}

fn tick_recent_molecule(time: Res<Time>, mut stats: ResMut<GameStats>) {
    if let Some((_, _, ref mut remaining)) = stats.recent_molecule {
        *remaining -= time.delta_secs();
        if *remaining <= 0.0 {
            stats.recent_molecule = None;
        }
    }
}

fn despawn_hud(mut commands: Commands, q: Query<Entity, With<HudElement>>) {
    for e in q.iter() {
        commands.entity(e).despawn_recursive();
    }
}
