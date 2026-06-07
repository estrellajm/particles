use bevy::prelude::*;

#[derive(States, Debug, Clone, PartialEq, Eq, Hash, Default)]
pub enum GameState {
    #[default]
    Home,
    Gameplay,
    Settings,
}

#[derive(Resource, Default)]
pub struct GameSettings {
    pub scientific_mode: bool,
    pub particle_effects: bool,
    pub difficulty: Difficulty,
}

#[derive(Default, Clone, PartialEq, Eq)]
pub enum Difficulty {
    Easy,
    #[default]
    Normal,
    Hard,
}

#[derive(Resource, Default)]
pub struct GameStats {
    pub energy: f32,
    pub molecules_formed: u32,
    pub recent_molecule: Option<(String, String, f32)>, // (name, formula, time_remaining)
}
