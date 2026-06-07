use bevy::prelude::*;
use rand::Rng;

pub struct StarfieldPlugin;

impl Plugin for StarfieldPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(Startup, spawn_starfield)
            .add_systems(Update, (twinkle_stars, drift_particles));
    }
}

#[derive(Component)]
struct Star {
    base_alpha: f32,
    phase: f32,
    speed: f32,
}

#[derive(Component)]
struct BackgroundParticle {
    drift_x: f32,
    drift_y: f32,
    phase: f32,
}

fn spawn_starfield(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<ColorMaterial>>,
    windows: Query<&Window>,
) {
    let mut rng = rand::thread_rng();
    let (w, h) = if let Ok(win) = windows.get_single() {
        (win.width(), win.height())
    } else {
        (390.0, 844.0)
    };

    // Background
    commands.spawn((
        Mesh2d(meshes.add(Rectangle::new(w * 4.0, h * 4.0))),
        MeshMaterial2d(materials.add(ColorMaterial::from(Color::srgb(0.01, 0.01, 0.04)))),
        Transform::from_translation(Vec3::new(0., 0., -10.0)),
    ));

    // Stars
    for _ in 0..150 {
        let x = rng.gen_range(-w..w);
        let y = rng.gen_range(-h..h);
        let size = rng.gen_range(0.8f32..2.5);
        let alpha = rng.gen_range(0.15f32..0.55);
        let phase = rng.gen_range(0.0f32..std::f32::consts::TAU);
        let speed = rng.gen_range(0.4f32..1.4);

        commands.spawn((
            Mesh2d(meshes.add(Circle::new(size))),
            MeshMaterial2d(materials.add(ColorMaterial::from(Color::srgba(1.0, 1.0, 1.0, alpha)))),
            Transform::from_translation(Vec3::new(x, y, -9.0)),
            Star { base_alpha: alpha, phase, speed },
        ));
    }

    // Floating nebula particles
    for _ in 0..20 {
        let x = rng.gen_range(-w / 2.0..w / 2.0);
        let y = rng.gen_range(-h / 2.0..h / 2.0);
        let size = rng.gen_range(3.0f32..7.0);
        let phase = rng.gen_range(0.0f32..std::f32::consts::TAU);

        commands.spawn((
            Mesh2d(meshes.add(Circle::new(size))),
            MeshMaterial2d(materials.add(ColorMaterial::from(Color::srgba(0.13, 0.78, 0.97, 0.12)))),
            Transform::from_translation(Vec3::new(x, y, -8.0)),
            BackgroundParticle {
                drift_x: rng.gen_range(-8.0f32..8.0),
                drift_y: rng.gen_range(-12.0f32..-3.0),
                phase,
            },
        ));
    }
}

fn twinkle_stars(
    time: Res<Time>,
    mut q: Query<(&MeshMaterial2d<ColorMaterial>, &mut Star)>,
    mut materials: ResMut<Assets<ColorMaterial>>,
) {
    for (mat_handle, mut star) in q.iter_mut() {
        star.phase += star.speed * time.delta_secs();
        let alpha = star.base_alpha * (0.4 + 0.6 * star.phase.sin().abs());
        if let Some(mat) = materials.get_mut(mat_handle.id()) {
            mat.color = Color::srgba(1.0, 1.0, 1.0, alpha);
        }
    }
}

fn drift_particles(
    time: Res<Time>,
    mut q: Query<(&mut Transform, &MeshMaterial2d<ColorMaterial>, &BackgroundParticle)>,
    mut materials: ResMut<Assets<ColorMaterial>>,
    windows: Query<&Window>,
) {
    let h = windows.get_single().map(|w| w.height()).unwrap_or(844.0);

    let t = time.elapsed_secs();
    for (mut transform, mat_handle, particle) in q.iter_mut() {
        let wave = (t * 0.3 + particle.phase).sin();
        transform.translation.y += particle.drift_y * time.delta_secs() * 0.12;
        transform.translation.x += particle.drift_x * time.delta_secs() * 0.06 * wave;

        // Wrap vertically
        if transform.translation.y < -h {
            transform.translation.y = h;
        }

        let alpha = 0.08 + 0.07 * (t * 0.4 + particle.phase).sin().abs();
        if let Some(mat) = materials.get_mut(mat_handle.id()) {
            mat.color = Color::srgba(0.13, 0.78, 0.97, alpha);
        }
    }
}
