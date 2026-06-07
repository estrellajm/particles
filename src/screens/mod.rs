mod home;
mod gameplay;
mod settings;

use bevy::prelude::*;

pub struct ScreensPlugin;

impl Plugin for ScreensPlugin {
    fn build(&self, app: &mut App) {
        app.add_plugins((
            home::HomeScreenPlugin,
            gameplay::GameplayScreenPlugin,
            settings::SettingsScreenPlugin,
        ));
    }
}
