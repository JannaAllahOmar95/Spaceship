let userInput;
let beams;
let planets;
let score = 0;
let livesText;
let scoreText;
let lives = 3;
let maxStars = 10;
let backgroundMusic;
let lastFiredTime = 0;
let updateFire = 0;
let fireRate = 250; //  ده فرق الوقت بين شعلات النار بتاعة الصاروخ
//  ده اول سين عملناه لصفحة المنيو اللي بتظهر ف الاول
class Scene1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Scene1' });
    }
    //  ال function دي بنحمل فيها الداتا بتاعتنا من الملف 
    preload() {
        this.load.image("start", "Assets/rocket.gif");
        this.load.audio("backgroundMusic", "Assets/start.mp3");
    }
    //  ال function دي بنظهر بقا الملفات اللي حملناها فوق
    create() {
        lives = 3;
        score = 0;
        this.livesText = this.add.text(16, 16, 'Lives: 3', { fontSize: '24px', fill: '#fff' });
        this.add.image(400, 300, 'start').setScale(1.3);
        this.add.text(20, 30, "Explore The Universe", { fontSize: '25px', fill: '#fff' });
        // زورار عشان احول من صفحة المنيو للعبة نفسها
        let switchButton = this.add.text(200, 500, 'Start The Game', { fontSize: '50px', fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('Scene2');
            });
        //  بشغل الاغنية اللي بتظهر ف ال  background  
        backgroundMusic = this.sound.add("backgroundMusic", { volume: 0.1 });
        backgroundMusic.play();
    }
    //   function بستخدمها عشان اعمل حركات ع الصور 
    update() {

    }
    onPlayerOverLap(player, planet) {
        planet.disableBody(true, true);
    }
}
//  ده سين اللعبة نفسها
class Scene2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Scene2' });
    }
    preload() {
        //  بحمل ال  spitesheet  بتاع الصاروخ
        this.load.spritesheet(
            {
                key: 'dude',
                url: 'Assets/player.png',
                frameConfig: {
                    frameWidth: 237.3333,
                    frameHeight: 351,
                    startFrame: 0,
                    endFrame: 3
                }
            });
        //بحمل الصور اللي هحتاجها ف اللعبة بتاعتنا
        this.load.image("bg", "Assets/background.jpeg");
        this.load.image("beam", "Assets/beam.png");
        this.load.image("beam2", "Assets/beam2.png");
        this.load.image("beam3", "Assets/beam3.png");
        this.load.image("planet", "Assets/planet.png");
        this.load.image("planet1", "Assets/planet1.png");
        this.load.image("planet2", "Assets/planet2.png");
        this.load.image("planet3", "Assets/planet3.png");
        this.load.image("planet4", "Assets/planet4.png");
        this.load.audio("fire", "Assets/fire.mp3");
        this.load.audio("destroy1", "Assets/destroy1.mp3");
        this.load.audio("destroy2", "Assets/destroy2.mp3");
        this.load.audio("destroy3", "Assets/destroy3.mp3");
    }
    create() {
        // بعرف اني هستخدم ال keyboard
        userInput = this.input.keyboard.createCursorKeys();
        // صورة الخلفية
        this.bg = this.add.tileSprite(400, 300, config.width, config.height, "bg");
        this.fireSound = this.sound.add("fire", { volume: 0.05 });
        this.destroy1 = this.sound.add("destroy1", { volume: 0.05 });
        this.destroy2 = this.sound.add("destroy2", { volume: 0.05 });
        this.destroy3 = this.sound.add("destroy3", { volume: 0.05 });
        //  بعمل حركة النجوم اللي بتنزل
        planets = this.physics.add.group(
            {
                key: ["planet1", "planet2", "planet3"],
                repeat: 2,
                setXY:
                {
                    x: 100,
                    y: 50,
                    stepX: 60 + Math.random() * 100,
                    stepY: 20 + Math.random() * 50,
                },
                setScale:
                {
                    x: 0.15,
                    y: 0.15,
                }
            });
        planets.children.iterate((planet) => {
            planet.setVelocityX(-100 + Math.random() * 200);
            planet.setVelocityY(50 + Math.random() * 50);
        });
        planets.children.entries.forEach((val) => {
            val.setBounce(1, 0);
        });
        this.physics.add.collider(planets, planets);
        // بظبط حركة الصاروخ و ظهوره
        let platforms = this.physics.add.staticGroup();
        this.player = this.physics.add.sprite(config.width / 2, config.height - 50, "dude");
        this.player.setCollideWorldBounds(true);
        this.player.setScale(0.2);
        // بوصل كل حركة بالزورار اللي هيحركها
        this.anims.create(
            {
                key: "left",
                frames: [{ key: "dude", frame: 0 }],
                frameRate: 10,
                repeat: -1
            });
        this.anims.create(
            {
                key: "right",
                frames: [{ key: "dude", frame: 2 }],
                frameRate: 10,
                repeat: -1
            });
        this.anims.create(
            {
                key: "idle",
                frames: [{ key: "dude", frame: 1 }],
                frameRate: 10,
                repeat: -1
            });
        // بيتعمل ضربات النار
        beams = this.physics.add.group(
            {
                defaultKey: 'beam',
                maxSize: -1,
                visible: false,
                active: false,
                key: 'beam'
            });
        this.physics.add.collider(this.player, platforms);
        this.physics.add.collider(this.player, planets, this.playerHitStar, null, this);
        livesText = this.add.text(20, 30, "Live X " + lives, { fontSize: '25px', fill: '#fff' });
        scoreText = this.add.text(640, 30, "Scores: " + score, { fontSize: '25px', fill: '#fff' });
    }
    //  بفعل التغيرات ف الحركة اللي انا  already  عرفتها فوق
    update() {
        livesText.setText('Lives: ' + lives);
        scoreText.setText('Score: ' + score);
        if (userInput.up.isDown) {
            this.player.anims.play("idle");
            this.player.setVelocityY(-200);
        } else if (userInput.down.isDown) {
            this.player.anims.play("idle");
            this.player.setVelocityY(200);
        } else {
            this.player.anims.play("idle");
            this.player.setVelocityY(0);
        }
        if (userInput.right.isDown) {
            this.player.anims.play("right", true);
            this.player.setVelocityX(200);
        } else if (userInput.left.isDown) {
            this.player.anims.play("left", true);
            this.player.setVelocityX(-200);
        } else {
            this.player.anims.play("idle");
            this.player.setVelocityX(0);
        }
        if (userInput.space.isDown && this.time.now - lastFiredTime > fireRate) {
            this.fireBeam();
            lastFiredTime = this.time.now;
        }
        // بخلي صورة الخلفية تتحرك معايا
        this.bg.tilePositionY -= 1;
        // بيتأكد اذا البلاير دمر عدد كواكب من غير ما يموت عشان يزود ال power و يزود الرصاص
        if (updateFire < 10) {
            beams.children.iterate((beam) => {
                fireRate = 250; // delay بين الطلقة و غيرها 
                beam.setTexture('beam');
                maxStars = 15;
            });
        } else if (updateFire < 30) {
            beams.children.iterate((beam) => {
                fireRate = 200
                maxStars = 20;
                beam.setTexture('beam2');
            });
        } else {
            beams.children.iterate((beam) => {
                fireRate = 150;
                maxStars = 25;
                beam.setTexture('beam3');
            });
        }
        // بيعدل مكان الكوكب بما يطلع من الاسكرين
        planets.children.iterate((planet) => {
            planet.y += 2;
            if (planet.y > config.height) {
                const newX = Math.random() * config.width;
                const newY = -30;
                planet.setPosition(newX, newY);
                planet.setScale(0.15, 0.15);
                // بيضيف سرعة عشوائية
                planet.setVelocityX(-150 + Math.random() * 200);
                planet.setVelocityY(50 + Math.random() * 50);
            }
        });
        this.physics.overlap(beams, planets, this.beamHitStar, null, this);
    }
    // لمايحصل اصتدام بين النار و الكواكب بيعمل check ايه اللي المفرزض يحصل في الكوكب
    beamHitStar(beam, planet) {
        let checkPlanet = planet.texture.key;
        //  بيعمل check انهي  texture محطوطة علي الكوكب و يحط ال  texture اللي بعدها
        switch (checkPlanet) {
            case 'planet1':
                planet.setTexture('planet2');
                this.destroy1.play();
                break;
            case 'planet2':
                planet.setTexture('planet3');
                this.destroy2.play();
                break;
            case 'planet3':
                planet.setTexture('planet4');
                this.destroy3.play();
                break;
            default:
                planet.destroy();
                const totalStars = planets.children.size;
                if (totalStars < maxStars) {
                    for (let i = 0; i < 3; i++) {
                        const newX = Math.random() * config.width;
                        const newY = -20;
                        const newPlanet = planets.create(newX, newY, 'planet1');
                        newPlanet.setScale(0.15, 0.15);
                        newPlanet.setBounce(0.5, 0.3);
                        newPlanet.setVelocityX(-150 + Math.random() * 200);
                        newPlanet.setVelocityY(50 + Math.random() * 50);
                        this.physics.add.collider(newPlanet, this.platform);
                    }
                }
                score++;
                updateFire++;
        }
        beam.destroy();

    }
    // لما يضرب النار
    fireBeam() {
        this.fireSound.play();
        const beam = beams.getFirstDead(true, this.player.x, this.player.y - 30);

        if (beam) {
            beam.setActive(true);
            beam.setVisible(true);
            beam.setVelocityY(-500);
            this.time.delayedCall(fireRate);

        }
    }
    // الاصتدام بين البلاير و الكواكب
    playerHitStar(player, planet) {
        player.disableBody(true, true);
        lives--;
        updateFire = 0;
        maxStars = 10;
        fireRate = 250;
        planets.clear(true, true);
        if (lives != 0) {
            player.setPosition(config.width / 2, config.height - 50);
            player.enableBody(false, player.x, player.y, true, true);

            this.restartStarGeneration();
        }
        else {
            this.scene.start('Scene3');
        }
    }
    // اعادةانشاء الكواكب من اعلي الاسكرين لما البلاير بيموت
    restartStarGeneration() {
        const totalStars = planets.children.size;
        const maxStars = 50;

        if (totalStars < maxStars) {
            // Generate three new planets at random locations
            for (let i = 0; i < 3; i++) {
                const newX = Math.random() * config.width;
                const newY = -20;
                const newPlanet = planets.create(newX, newY, 'planet1');
                newPlanet.setScale(0.15, 0.15);
                newPlanet.setBounce(0.5, .3);
                newPlanet.setVelocityX(-150 + Math.random() * 200);
                newPlanet.setVelocityY(50 + Math.random() * 50);
                this.physics.add.collider(newPlanet, this.platform);
            }
        }
    }
}
//  دي اخر صفحة بتاعة انه خسر خلاص و جاب  game over
class Scene3 extends Phaser.Scene {
    constructor() {
        super({ key: 'Scene3' });
    }
    preload() {
        this.load.image("end", "Assets/end.jpeg");
        this.load.audio("end", "Assets/end.wav");
    }
    create() {
        backgroundMusic.stop();
        this.add.image(400, 300, 'end').setScale(1.23);
        // Add a button to switch to Scene2
        this.add.text(180, 100, 'Your Score is ' + score, { fontSize: '50px', fill: '#092635' })
        let switchButton = this.add.text(180, 500, 'Wanna Play Again!!', { fontSize: '50px', fill: '#092635' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('Scene1');
            });
        const end = this.sound.add("end", { volume: 0.3 });
        end.play();
    }
    update() {
        // هستخدم ده لو عايزين احرك حاجة ف الصفحة دي
    }
}
//  متغير بستخدمه عشان اتحكم ف صفحة الويب كلها
// موجود فيه السين اللي بغير ما بينهم
let config =
{
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Scene1, Scene2, Scene3],
    physics:
    {
        default: 'arcade',
        arcade:
        {
            debug: false
        }
    }
};
// ده اللي بيعمل اللعبة
let game = new Phaser.Game(config);
