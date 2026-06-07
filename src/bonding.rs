use bevy::prelude::*;
use crate::atoms::{spawn_molecule, Atom, AtomType, GameEntity, Molecule, MoleculeType};
use crate::drag::DragState;
use crate::state::{GameState, GameStats};

pub struct BondingPlugin;

impl Plugin for BondingPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(
            Update,
            check_bonding
                .run_if(in_state(GameState::Gameplay))
                .run_if(resource_changed::<DragState>),
        );
    }
}

const BOND_DISTANCE: f32 = 55.0;

type AtomEntry = (Entity, Vec2, AtomType);

fn check_bonding(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<ColorMaterial>>,
    atom_q: Query<(Entity, &GlobalTransform, &Atom)>,
    drag_state: Res<DragState>,
    mut stats: ResMut<GameStats>,
) {
    if drag_state.is_dragging {
        return;
    }

    let atoms: Vec<AtomEntry> = atom_q
        .iter()
        .map(|(e, t, a)| (e, t.translation().truncate(), a.atom_type.clone()))
        .collect();

    // Simple two-atom bonds
    for i in 0..atoms.len() {
        for j in (i + 1)..atoms.len() {
            let (e1, pos1, ref type1) = atoms[i];
            let (e2, pos2, ref type2) = atoms[j];

            if (pos1 - pos2).length() > BOND_DISTANCE {
                continue;
            }

            let result = match (type1, type2) {
                (AtomType::Hydrogen, AtomType::Hydrogen) => Some((MoleculeType::H2, vec![e1, e2])),
                (AtomType::Oxygen, AtomType::Oxygen) => Some((MoleculeType::O2, vec![e1, e2])),
                (AtomType::Carbon, AtomType::Oxygen) | (AtomType::Oxygen, AtomType::Carbon) => {
                    Some((MoleculeType::CO, vec![e1, e2]))
                }
                _ => None,
            };

            if let Some((mol_type, entities)) = result {
                let center = (pos1 + pos2) / 2.0;
                form_molecule(&mut commands, &mut meshes, &mut materials, &mol_type, center, &entities, &mut stats);
                return;
            }
        }
    }

    if try_water(&mut commands, &mut meshes, &mut materials, &atoms, &mut stats) {
        return;
    }
    try_methane(&mut commands, &mut meshes, &mut materials, &atoms, &mut stats);
}

fn form_molecule(
    commands: &mut Commands,
    meshes: &mut Assets<Mesh>,
    materials: &mut Assets<ColorMaterial>,
    mol_type: &MoleculeType,
    center: Vec2,
    entities: &[Entity],
    stats: &mut GameStats,
) {
    for &e in entities {
        commands.entity(e).despawn_recursive();
    }

    spawn_molecule(commands, meshes, materials, mol_type, center);

    stats.molecules_formed += 1;
    stats.energy = (stats.energy + 15.0).min(100.0);
    stats.recent_molecule = Some((
        mol_type.name().to_string(),
        mol_type.formula().to_string(),
        3.0,
    ));
}

fn try_water(
    commands: &mut Commands,
    meshes: &mut Assets<Mesh>,
    materials: &mut Assets<ColorMaterial>,
    atoms: &[AtomEntry],
    stats: &mut GameStats,
) -> bool {
    let hydrogens: Vec<_> = atoms.iter().filter(|(_, _, t)| *t == AtomType::Hydrogen).collect();
    let oxygens: Vec<_> = atoms.iter().filter(|(_, _, t)| *t == AtomType::Oxygen).collect();

    for (oe, opos, _) in &oxygens {
        let nearby_h: Vec<_> = hydrogens
            .iter()
            .filter(|(_, hpos, _)| (*hpos - *opos).length() < BOND_DISTANCE * 1.2)
            .collect();

        if nearby_h.len() >= 2 {
            let (he1, hpos1, _) = nearby_h[0];
            let (he2, hpos2, _) = nearby_h[1];
            let center = (*opos + *hpos1 + *hpos2) / 3.0;
            form_molecule(commands, meshes, materials, &MoleculeType::H2O, center, &[*oe, *he1, *he2], stats);
            return true;
        }
    }
    false
}

fn try_methane(
    commands: &mut Commands,
    meshes: &mut Assets<Mesh>,
    materials: &mut Assets<ColorMaterial>,
    atoms: &[AtomEntry],
    stats: &mut GameStats,
) -> bool {
    let hydrogens: Vec<_> = atoms.iter().filter(|(_, _, t)| *t == AtomType::Hydrogen).collect();
    let carbons: Vec<_> = atoms.iter().filter(|(_, _, t)| *t == AtomType::Carbon).collect();

    for (ce, cpos, _) in &carbons {
        let nearby_h: Vec<_> = hydrogens
            .iter()
            .filter(|(_, hpos, _)| (*hpos - *cpos).length() < BOND_DISTANCE * 1.5)
            .collect();

        if nearby_h.len() >= 4 {
            let center = nearby_h.iter().take(4).fold(*cpos, |a, (_, p, _)| a + *p) / 5.0;
            let entities: Vec<Entity> = std::iter::once(*ce)
                .chain(nearby_h.iter().take(4).map(|(e, _, _)| *e))
                .collect();
            form_molecule(commands, meshes, materials, &MoleculeType::CH4, center, &entities, stats);
            return true;
        }
    }
    false
}
