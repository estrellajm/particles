use bevy::prelude::*;
use rand::Rng;
use crate::state::GameState;

pub struct AtomsPlugin;

impl Plugin for AtomsPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(OnEnter(GameState::Gameplay), spawn_atoms)
            .add_systems(OnExit(GameState::Gameplay), despawn_atoms)
            .add_systems(
                Update,
                animate_electrons.run_if(in_state(GameState::Gameplay)),
            )
            .add_systems(
                Update,
                animate_glow.run_if(in_state(GameState::Gameplay)),
            )
            .add_systems(
                Update,
                animate_proximity_rings.run_if(in_state(GameState::Gameplay)),
            );
    }
}

#[derive(Component, Clone, PartialEq, Eq)]
pub enum AtomType {
    Hydrogen,
    Oxygen,
    Carbon,
}

impl AtomType {
    pub fn symbol(&self) -> &'static str {
        match self {
            AtomType::Hydrogen => "H",
            AtomType::Oxygen => "O",
            AtomType::Carbon => "C",
        }
    }

    pub fn color(&self) -> Color {
        match self {
            AtomType::Hydrogen => Color::srgb(0.66, 0.33, 0.97),
            AtomType::Oxygen => Color::srgb(0.13, 0.77, 0.37),
            AtomType::Carbon => Color::srgb(0.98, 0.45, 0.09),
        }
    }

    pub fn glow_color(&self) -> Color {
        match self {
            AtomType::Hydrogen => Color::srgba(0.66, 0.33, 0.97, 0.25),
            AtomType::Oxygen => Color::srgba(0.13, 0.77, 0.37, 0.25),
            AtomType::Carbon => Color::srgba(0.98, 0.45, 0.09, 0.25),
        }
    }

    pub fn electron_shells(&self) -> Vec<u32> {
        match self {
            AtomType::Hydrogen => vec![1],
            AtomType::Oxygen => vec![2, 6],
            AtomType::Carbon => vec![2, 4],
        }
    }
}

#[derive(Component, Clone)]
pub struct Atom {
    pub atom_type: AtomType,
}

#[derive(Component)]
pub struct Molecule {
    pub formula: String,
    pub name: String,
    pub molecule_type: MoleculeType,
}

#[derive(Clone, PartialEq, Eq)]
pub enum MoleculeType {
    H2,
    O2,
    H2O,
    CO,
    CH4,
}

impl MoleculeType {
    pub fn formula(&self) -> &'static str {
        match self {
            MoleculeType::H2 => "H2",
            MoleculeType::O2 => "O2",
            MoleculeType::H2O => "H2O",
            MoleculeType::CO => "CO",
            MoleculeType::CH4 => "CH4",
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            MoleculeType::H2 => "Hydrogen Gas",
            MoleculeType::O2 => "Oxygen Gas",
            MoleculeType::H2O => "Water",
            MoleculeType::CO => "Carbon Monoxide",
            MoleculeType::CH4 => "Methane",
        }
    }

    pub fn color(&self) -> Color {
        Color::srgb(0.98, 0.75, 0.14)
    }
}

#[derive(Component)]
pub struct GameEntity;

#[derive(Component)]
pub struct GlowEffect {
    pub phase: f32,
    pub speed: f32,
    pub base_alpha: f32,
    pub r: f32,
    pub g: f32,
    pub b: f32,
}

#[derive(Component)]
pub struct Electron {
    pub orbit_radius: f32,
    pub angular_speed: f32,
    pub angle: f32,
}

#[derive(Component)]
pub struct ProximityRing {
    pub phase: f32,
}

fn spawn_atoms(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<ColorMaterial>>,
) {
    let mut rng = rand::thread_rng();
    let atom_specs: &[(AtomType, Vec2)] = &[
        (AtomType::Hydrogen, Vec2::new(-120., 200.)),
        (AtomType::Hydrogen, Vec2::new(60., 200.)),
        (AtomType::Oxygen, Vec2::new(130., 80.)),
        (AtomType::Carbon, Vec2::new(-130., -100.)),
        (AtomType::Hydrogen, Vec2::new(120., -100.)),
    ];

    for (atom_type, pos) in atom_specs {
        let color = atom_type.color();
        let glow = atom_type.glow_color();
        let shells = atom_type.electron_shells();
        let symbol = atom_type.symbol().to_string();
        let glow_srgba = glow.to_srgba();

        let parent = commands
            .spawn((
                Atom { atom_type: atom_type.clone() },
                Transform::from_translation(pos.extend(1.0)),
                Visibility::Visible,
                GameEntity,
            ))
            .id();

        // Proximity ring (annulus, shown when near another atom)
        let ring_mat = materials.add(ColorMaterial::from(Color::srgba(1.0, 0.9, 0.2, 0.0)));
        let ring = commands
            .spawn((
                Mesh2d(meshes.add(Annulus::new(30.0, 32.5))),
                MeshMaterial2d(ring_mat),
                Transform::from_translation(Vec3::new(0., 0., -0.3)),
                ProximityRing { phase: 0.0 },
            ))
            .id();
        commands.entity(parent).add_child(ring);

        // Glow halo (large circle, semi-transparent)
        let glow_mat = materials.add(ColorMaterial::from(glow));
        let glow_entity = commands
            .spawn((
                Mesh2d(meshes.add(Circle::new(42.0))),
                MeshMaterial2d(glow_mat),
                Transform::from_translation(Vec3::new(0., 0., -0.2)),
                GlowEffect {
                    phase: rng.gen_range(0.0f32..std::f32::consts::TAU),
                    speed: 0.7,
                    base_alpha: glow_srgba.alpha,
                    r: glow_srgba.red,
                    g: glow_srgba.green,
                    b: glow_srgba.blue,
                },
            ))
            .id();
        commands.entity(parent).add_child(glow_entity);

        // Main atom circle
        let circle_mat = materials.add(ColorMaterial::from(color));
        let circle = commands
            .spawn((
                Mesh2d(meshes.add(Circle::new(20.0))),
                MeshMaterial2d(circle_mat),
                Transform::from_translation(Vec3::new(0., 0., 0.1)),
            ))
            .id();
        commands.entity(parent).add_child(circle);

        // Symbol label
        let label = commands
            .spawn((
                Text2d::new(symbol),
                TextFont { font_size: 15.0, ..default() },
                TextColor(Color::WHITE),
                Transform::from_translation(Vec3::new(0., 0., 0.5)),
            ))
            .id();
        commands.entity(parent).add_child(label);

        // Electrons
        let base_radius = 32.0f32;
        let shell_spacing = 18.0f32;

        for (shell_idx, &electron_count) in shells.iter().enumerate() {
            let orbit_radius = base_radius + (shell_idx as f32 * shell_spacing);
            let clockwise = shell_idx % 2 == 0;
            let base_speed = if clockwise { 1.4 } else { -1.0 };

            for i in 0..electron_count {
                let start_angle = (i as f32 / electron_count as f32) * std::f32::consts::TAU;
                let ex = orbit_radius * start_angle.cos();
                let ey = orbit_radius * start_angle.sin();
                let speed = base_speed * (1.0 + i as f32 * 0.04);

                let electron_mat = materials.add(ColorMaterial::from(Color::srgb(0.4, 0.91, 0.97)));
                let electron = commands
                    .spawn((
                        Mesh2d(meshes.add(Circle::new(2.5))),
                        MeshMaterial2d(electron_mat),
                        Transform::from_translation(Vec3::new(ex, ey, 0.3)),
                        Electron {
                            orbit_radius,
                            angular_speed: speed,
                            angle: start_angle,
                        },
                    ))
                    .id();
                commands.entity(parent).add_child(electron);
            }
        }
    }
}

pub fn spawn_molecule(
    commands: &mut Commands,
    meshes: &mut Assets<Mesh>,
    materials: &mut Assets<ColorMaterial>,
    mol_type: &MoleculeType,
    center: Vec2,
) -> Entity {
    let color = mol_type.color();

    let parent = commands
        .spawn((
            Molecule {
                formula: mol_type.formula().to_string(),
                name: mol_type.name().to_string(),
                molecule_type: mol_type.clone(),
            },
            Transform::from_translation(center.extend(1.0)),
            Visibility::Visible,
            GameEntity,
        ))
        .id();

    // Glow
    let glow_mat = materials.add(ColorMaterial::from(Color::srgba(0.98, 0.75, 0.14, 0.3)));
    let glow = commands
        .spawn((
            Mesh2d(meshes.add(Circle::new(38.0))),
            MeshMaterial2d(glow_mat),
            Transform::from_translation(Vec3::new(0., 0., -0.1)),
        ))
        .id();
    commands.entity(parent).add_child(glow);

    // Body
    let mat = materials.add(ColorMaterial::from(color));
    let body = commands
        .spawn((
            Mesh2d(meshes.add(Circle::new(24.0))),
            MeshMaterial2d(mat),
            Transform::from_translation(Vec3::new(0., 0., 0.1)),
        ))
        .id();
    commands.entity(parent).add_child(body);

    // Label
    let label = commands
        .spawn((
            Text2d::new(mol_type.formula()),
            TextFont { font_size: 13.0, ..default() },
            TextColor(Color::WHITE),
            Transform::from_translation(Vec3::new(0., -34., 0.5)),
        ))
        .id();
    commands.entity(parent).add_child(label);

    parent
}

fn animate_electrons(time: Res<Time>, mut q: Query<(&mut Transform, &mut Electron)>) {
    for (mut transform, mut electron) in q.iter_mut() {
        electron.angle += electron.angular_speed * time.delta_secs();
        transform.translation.x = electron.orbit_radius * electron.angle.cos();
        transform.translation.y = electron.orbit_radius * electron.angle.sin();
    }
}

fn animate_glow(
    time: Res<Time>,
    mut q: Query<(&MeshMaterial2d<ColorMaterial>, &mut GlowEffect)>,
    mut materials: ResMut<Assets<ColorMaterial>>,
) {
    for (mat_handle, mut glow) in q.iter_mut() {
        glow.phase += glow.speed * time.delta_secs();
        let alpha = glow.base_alpha * (0.5 + 0.5 * glow.phase.sin().abs());
        if let Some(mat) = materials.get_mut(mat_handle.id()) {
            mat.color = Color::srgba(glow.r, glow.g, glow.b, alpha);
        }
    }
}

fn animate_proximity_rings(
    atom_q: Query<(Entity, &GlobalTransform), With<Atom>>,
    mut ring_q: Query<(&Parent, &MeshMaterial2d<ColorMaterial>, &mut ProximityRing)>,
    mut materials: ResMut<Assets<ColorMaterial>>,
    time: Res<Time>,
) {
    const BOND_DIST: f32 = 55.0;
    const PROX_DIST: f32 = 100.0;

    let positions: Vec<(Entity, Vec2)> = atom_q
        .iter()
        .map(|(e, t)| (e, t.translation().truncate()))
        .collect();

    for (parent, mat_handle, mut ring) in ring_q.iter_mut() {
        ring.phase += 2.5 * time.delta_secs();
        let pulse = 0.5 + 0.5 * ring.phase.sin();

        let parent_id = parent.get();
        let Some((_, pos)) = positions.iter().find(|(e, _)| *e == parent_id) else {
            continue;
        };

        let min_dist = positions
            .iter()
            .filter(|(e, _)| *e != parent_id)
            .map(|(_, p)| (*p - *pos).length())
            .fold(f32::MAX, f32::min);

        let (r, g, b, base_alpha) = if min_dist < BOND_DIST {
            (1.0f32, 0.9, 0.2, 0.8)
        } else if min_dist < PROX_DIST {
            (0.3, 0.6, 1.0, 0.4)
        } else {
            (0.3, 0.6, 1.0, 0.0)
        };

        if let Some(mat) = materials.get_mut(mat_handle.id()) {
            mat.color = Color::srgba(r, g, b, base_alpha * pulse);
        }
    }
}

fn despawn_atoms(mut commands: Commands, q: Query<Entity, With<GameEntity>>) {
    for e in q.iter() {
        commands.entity(e).despawn_recursive();
    }
}
