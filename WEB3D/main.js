/* Bibliotecas */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* CENA + VARIAVEIS */
const window_width = 1050;
const window_height = 625;
const scene = new THREE.Scene();

var sceneLightStatus = true;
var bulbStatus = true;

var gavetasOpen = true;
var portasOpen = true;

// let pinhoMaterial = new THREE.MeshNormalMaterial();
// let mognoMaterial = new THREE.MeshNormalMaterial();

//	Cria a Cena
scene.background = new THREE.Color(0xfcfcfc);				//	Define a Cor de Fundo da Cena
scene.fog = new THREE.Fog(0xcce0ff, 5, 100);				//	Define a Cor da Neblina da Cena

/* CANVAS */
let myCanvas = document.getElementById("meuCanvas");
let renderer = new THREE.WebGLRenderer({
	canvas: myCanvas,										// Liga ao Canvas do HTML
	antialias: true, 										// Liga o Anti-Aliasing
});
renderer.setSize(window_width, window_height); 				//	Define o Tamanho para o Tamanho do Canvas
renderer.setPixelRatio(window.devicePixelRatio);			//	Define o Pixel Ratio para o Pixel Ratio do Dispositivo
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;				//	Define o Tipo de Sombra

/* CAMERA */
let aspect = window_width / window_height; 					// Define a Razão de Aspecto
let camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
camera.position.set(0.5, 1, 2); 							//Define a Posição Inicial da Camara

/* ORBITS CONTROLS */
let controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 0.5, 0); 			// Ponto alvo para a órbita
controls.autoRotate = true; 								// Ativa rotação automática
controls.autoRotateSpeed = 0.5; 							// Velocidade da rotação automática
controls.enableDamping = true; 								// Ativa o damping (simula a inércia - ex. a rotacao continua após arrastar o rato)
controls.maxDistance = 3; 									// Distância máxima para zoom
controls.minDistance = 1; 									// Distância mínima para zoom
controls.zoomSpeed = 0.7; 									// Velocidade do zoom
controls.enablePan = false; 								// Desativação do movimento lateral (pan)
controls.minPolarAngle = 0; 								// Ângulo mínimo de rotação vertical
controls.maxPolarAngle = Math.PI * 0.5; 					// Ângulo máximo de rotação vertical

/* LUZES */
// Para apontar o spotLight para o objeto necessitamos de um objeto que sirva de alvo
let targetObject = new THREE.Object3D();
targetObject.position.set(.13, 0.5, .13);
scene.add(targetObject);

/* LUZ DO CANDEEIRO */
let lightBulb = new THREE.SpotLight(0xfce8b1, 3); 			// Cria a Luz
lightBulb.position.set(-.39, 1.09, -.15);					// Define a Posição da Luz
lightBulb.angle = Math.PI / 5;								// Define o Ângulo da Luz
lightBulb.penumbra = 0.15;									// Define a Penumbra da Luz - desfocagem da sombra
lightBulb.distance = .8;									// Define a Distância da Luz
lightBulb.castShadow = true;								// Ativa a Sombra da Luz
lightBulb.shadow.camera.near = 0.01;						// Define o Plano Near da Camera da Sombra
lightBulb.shadow.camera.far = 0.05;							// Define o Plano Far da Camera da Sombra
lightBulb.target = targetObject;							// Define o Alvo da Luz
lightBulb.shadow.bias = -0.0001								// Serve para corrigir sombras
lightBulb.intensity = 5;									// Intensidade
scene.add(lightBulb);
// scene.add(new THREE.SpotLightHelper(lightBulb));			// Adiciona um Helper à Luz

/* LUZ AMBIENTE */
let ambienceLight1 = new THREE.PointLight(0xffffff, 50);	//	Cria a Luz
ambienceLight1.position.set(-3, 3, -3);						//	Define a Posição da Luz
scene.add(ambienceLight1);									//	Adiciona a Luz à Cena
let ambienceLight2 = new THREE.PointLight(0xffffff, 50);	//	Cria a Luz
ambienceLight2.position.set(3, 3, 3);						//	Define a Posição da Luz
scene.add(ambienceLight2);					//	Adiciona a Luz à Cena

/* LUZ DIRECIONAL C/ PLANO SOMBRAS */
let light2 = new THREE.DirectionalLight(0xffffff, 5);		//	Cria a Luz
light2.position.set(.5, 1.5, .8);							//	Define a Posição da Luz
light2.castShadow = true;									//	Ativa a Sombra da Luz
light2.shadow.bias = -0.0001								//	Serve para corrigir sombras
light2.intensity = 5;
light2.shadow.radius = 2
light2.shadow.blurSamples = 15								//	Intensidade
scene.add(light2);											//	Adiciona a Luz à Cena
// scene.add(new THREE.DirectionalLightHelper(light2, 1));	//	Adiciona um Helper à Luz

/* PLANOS */
let geometry = new THREE.PlaneGeometry(100, 100);
geometry.rotateX(-Math.PI / 2); 							//Roda o Plano 90º no sentido dos ponteiros do relógio
let shadowMat = new THREE.ShadowMaterial(); 				//Cria Material para as Sombras
shadowMat.opacity = 0.5; 									//Opacidade das Sombras
let shadowPlane = new THREE.Mesh(geometry, shadowMat);		// Cria Plano
scene.add(shadowPlane);

/* Variáveis */

let objects = [];
let objects_wood = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

/* Global Mixer Actions and Clips */
var gaveta_L, gaveta_R, porta_L, porta_R;
var gaveta_L_Action, gaveta_R_Action, porta_L_Action, porta_R_Action;
var material_std = new THREE.MeshStandardMaterial();

/* Animation Mixer */

var mixer = new THREE.AnimationMixer(scene);
var clock = new THREE.Clock();

/* glTF Loader*/
let loader = new GLTFLoader();
loader.load('./vintageDesk.gltf',
	function (gltf) {
		scene.add(gltf.scene);

		scene.traverse(function (element) {
			if (element.isMesh) {
				element.castShadow = true;
				element.receiveShadow = true;
			}
			if (element.name.includes("Porta") || element.name.includes("Gaveta")) {
				objects.push(element);
			}
			if (element.isMesh && element.material.name.includes("Wood")) {
				objects_wood.push(element);
			}
		});

		material_std.copy(scene.getObjectByName('Tampo').material); // Guarda o material padrão
		// .clone(scene.getObjectByName('Tampo').material); // Guarda o material padrão

		/* Create clips */
		gaveta_L = THREE.AnimationClip.findByName(gltf.animations, 'Gaveta_LAction');
		gaveta_R = THREE.AnimationClip.findByName(gltf.animations, 'Gaveta_RAction');
		porta_L = THREE.AnimationClip.findByName(gltf.animations, 'Porta_LAction');
		porta_R = THREE.AnimationClip.findByName(gltf.animations, 'Porta_RAction');
		const bandeira = THREE.AnimationClip.findByName(gltf.animations, 'Bandeira_Action');
		
		const bandeira_action = mixer.clipAction(bandeira);
		bandeira_action.setLoop(THREE.LoopPingPong);
		bandeira_action.play();

		gaveta_L_Action = mixer.clipAction(gaveta_L);
		gaveta_R_Action = mixer.clipAction(gaveta_R);
		porta_L_Action = mixer.clipAction(porta_L);
		porta_R_Action = mixer.clipAction(porta_R);

		/*
		pinhoMaterial = scene.getObjectByName('Porta_L').material;
		mognoMaterial = scene.getObjectByName('Gaveta_L').material;
		*/
	});
console.log(objects);
console.log(objects_wood);
// console.log(material_std);

/* Raycaster */
function rayCasterFunction() {
	raycaster.setFromCamera(mouse, camera);
	let intersetados = raycaster.intersectObjects(objects);
	if (intersetados.length > 0) {
		if (intersetados[0].object.parent.name.includes("Porta")) {  // Se o nome de um dos objetos intersetados contiver a palavra "Porta"
			abrirPortas();
		}
		if (intersetados[0].object.parent.name.includes("Gaveta")) { // Se o nome de um dos objetos intersetados contiver a palavra "Porta"
			abrirGaveta();
		}
	}
}

var canvas = document.getElementById('meuCanvas');
canvas.onclick = function (evento) {
	var limites = evento.target.getBoundingClientRect()
	mouse.x = 2 * (evento.clientX - limites.left) / parseInt(meuCanvas.style.width) - 1
	mouse.y = 1 - 2 * (evento.clientY - limites.top) / parseInt(meuCanvas.style.height)
	rayCasterFunction();
};
/* Função animate */
function animate() {
	requestAnimationFrame(animate);
	controls.update();
	mixer.update(clock.getDelta());
	renderer.render(scene, camera);
}

/* Animate */
animate();

/* Buttons */

// Iniciar/Pausar rotação automatica
let btn_play_pause = document.getElementById('btn_play_pause');
btn_play_pause.addEventListener('click', () => {
	controls.autoRotate = !controls.autoRotate;
	if (controls.autoRotate) {
		btn_play_pause.innerHTML = '<i class="fa-solid fa-pause fa-xl"></i><label class="fa-regular">PAUSAR ROTACAO</label>';
	} else {
		btn_play_pause.innerHTML = '<i class="fa-solid fa-play fa-xl"></i><label class="fa-regular">Ligar ROTACAO</label>';
	}
});

// Rodar para a esquerda/direita
let btn_slow_fast = document.getElementById('btn_slow_fast');
btn_slow_fast.addEventListener('click', () => {
	if (controls.autoRotateSpeed == 0.5) {
		controls.autoRotateSpeed = -0.5;
		btn_slow_fast.innerHTML = '<i class="fa-solid fa-arrow-rotate-right fa-xl"></i><label class="fa-regular">Rodar para direita</label>'
	} else {
		controls.autoRotateSpeed = 0.5;
		btn_slow_fast.innerHTML = '<i class="fa-solid fa-arrow-rotate-left fa-xl"></i><label class="fa-regular">Rodar para esquerda</label>'
	}
});

// Ativar/Desativar modo noturno
let btn_color_white = document.getElementById('btn_color_white');
btn_color_white.addEventListener('click', () => {
	if (sceneLightStatus) {
		sceneLightStatus = false;
		ambienceLight1.color = new THREE.Color(0xffffff);
		ambienceLight2.color = new THREE.Color(0xffffff);
		light2.color = new THREE.Color(0xffffff);
		scene.background = new THREE.Color(0xfcfcfc);
		btn_color_white.innerHTML = '<i class="fa-regular fa-moon fa-xl"></i><label class="fa-regular">ativar Modo noturno</label>';
	} else {
		sceneLightStatus = true;
		ambienceLight1.color = new THREE.Color(0xffffff);
		ambienceLight2.color = new THREE.Color(0xffffff);
		light2.color = new THREE.Color(0xffffff);
		scene.background = new THREE.Color(0x242323);
		btn_color_white.innerHTML = '<i class="fa-regular fa-sun fa-xl"></i><label class="fa-regular">ativar Modo diurno</label>';
	}
});

// Alterar cor da luz do candeeiro
let color_Slider = document.getElementById('colorSlider');
color_Slider.addEventListener('input', update_bulbColor);
function update_bulbColor() {
	let txt_bulb = document.getElementById('textBulb');
	switch (color_Slider.value) {
		case '0':
			lightBulb.color = new THREE.Color(0xfce8b1);
			txt_bulb.innerText = 'LAMPADA: AMARELA';
			break;
		case '1':
			//verde
			lightBulb.color = new THREE.Color(0x00ff00);
			txt_bulb.innerText = 'LAMPADA: VERDE';
			break;
		case '2':
			//azul
			lightBulb.color = new THREE.Color(0x0000ff);
			txt_bulb.innerText = 'LAMPADA: AZUL';
			break;
		case '3':
			//vermelho
			lightBulb.color = new THREE.Color(0xff0000);
			txt_bulb.innerText = 'LAMPADA: VERMELHA';
			break;
		case '4':
			//laranja
			lightBulb.color = new THREE.Color(0xffa500);
			txt_bulb.innerText = 'LAMPADA: LARANJA';
			break;
		case '5':
			//branco
			lightBulb.color = new THREE.Color(0xffffff);
			txt_bulb.innerText = 'LAMPADA: BRANCA';
			break;
	}
}

// Ligar/Desligar candeeiro
let btn_bulb = document.getElementById('btn_bulb_on');
btn_bulb.addEventListener('click', () => {
	if (bulbStatus) {
		lightBulb.intensity = 0;
		btn_bulb.innerHTML = '<i class="fa-solid fa-toggle-off fa-xl"></i><label class="fa-regular">Candeeiro: Desligado</label>';
		bulbStatus = false;
	} else {
		lightBulb.intensity = 5;
		btn_bulb.innerHTML = '<i class="fa-solid fa-toggle-on fa-xl"></i><label class="fa-regular">Candeeiro: Ligado</label>';
		bulbStatus = true;
	}
});

// Abrir/Fechar gavetas
const btn_gavetas = document.getElementById('btn_gavetas');
btn_gavetas.addEventListener('click', () => {
	abrirGaveta();
});
function abrirGaveta() {
	if (gavetasOpen) {
		gavetasOpen = false;											//	Define o estado das gavetas como fechadas
		gaveta_L_Action.paused = false;									//	Despausa a Animação
		gaveta_L_Action.setLoop(THREE.LoopOnce);						//	Define o Loop da Animação
		gaveta_L_Action.timeScale = gaveta_L_Action.timeScale * -1;		//	Inverte o sentido da Animação
		gaveta_L_Action.clampWhenFinished = true;						//	coloca a animação em pausa no fim
		gaveta_L_Action.play();

		gaveta_R_Action.paused = false;									//	Despausa a Animação
		gaveta_R_Action.setLoop(THREE.LoopOnce);						//	Define o Loop da Animação
		gaveta_R_Action.timeScale = gaveta_R_Action.timeScale * -1;		//	Inverte o sentido da Animação
		gaveta_R_Action.clampWhenFinished = true;						//	coloca a animação em pausa no fim
		gaveta_R_Action.play();
	} else {
		gavetasOpen = true;												//	Define o estado das gavetas como abertas
		gaveta_L_Action.paused = false;									//	Despausa a Animação
		gaveta_L_Action.setLoop(THREE.LoopOnce); 						//	Define o Loop da Animação
		gaveta_L_Action.timeScale = gaveta_L_Action.timeScale * -1;		//	Inverte o sentido da Animação
		gaveta_L_Action.clampWhenFinished = true;						//	coloca a animação em pausa no fim
		gaveta_L_Action.play();											//	Executa a Animação

		gaveta_R_Action.paused = false;									//	Despausa a Animação
		gaveta_R_Action.setLoop(THREE.LoopOnce); 						//	Define o Loop da Animação
		gaveta_R_Action.timeScale = gaveta_R_Action.timeScale * -1;		//	Inverte o sentido da Animação
		gaveta_R_Action.clampWhenFinished = true;						//	coloca a animação em pausa no fim
		gaveta_R_Action.play();											//	Executa a Animação
	}
};

// Abrir/Fechar portas
const btn_portas = document.getElementById('btn_portas');
btn_portas.addEventListener('click', () => {
	abrirPortas();
});
function abrirPortas() {
	if (portasOpen) {
		portasOpen = false;											//	Define o estado das gavetas como fechadas
		porta_L_Action.paused = false;									//	Despausa a Animação
		porta_L_Action.setLoop(THREE.LoopOnce);						//	Define o Loop da Animação
		porta_L_Action.timeScale = porta_L_Action.timeScale * -1;		//	Inverte o sentido da Animação
		porta_L_Action.clampWhenFinished = true;						//	coloca a animação em pausa no fim
		porta_L_Action.play();

		porta_R_Action.paused = false;									//	Despausa a Animação
		porta_R_Action.setLoop(THREE.LoopOnce);						//	Define o Loop da Animação
		porta_R_Action.timeScale = porta_R_Action.timeScale * -1;		//	Inverte o sentido da Animação
		porta_R_Action.clampWhenFinished = true;						//	coloca a animação em pausa no fim
		porta_R_Action.play();
	} else {
		portasOpen = true;												//	Define o estado das gavetas como abertas
		porta_L_Action.paused = false;									//	Despausa a Animação
		porta_L_Action.setLoop(THREE.LoopOnce); 						//	Define o Loop da Animação
		porta_L_Action.timeScale = porta_L_Action.timeScale * -1;		//	Inverte o sentido da Animação
		porta_L_Action.clampWhenFinished = true;						//	coloca a animação em pausa no fim
		porta_L_Action.play();											//	Executa a Animação

		porta_R_Action.paused = false;									//	Despausa a Animação
		porta_R_Action.setLoop(THREE.LoopOnce); 						//	Define o Loop da Animação
		porta_R_Action.timeScale = porta_R_Action.timeScale * -1;		//	Inverte o sentido da Animação
		porta_R_Action.clampWhenFinished = true;						//	coloca a animação em pausa no fim
		porta_R_Action.play();
	}
}

/* Novos materiais */
const texture_loader = new THREE.TextureLoader();

const carvalho = new THREE.MeshStandardMaterial({
	map: texture_loader.load("./model/materials/carvalho/color.jpg"),
	normalMap: texture_loader.load("./model/materials/carvalho/normal.jpg"),
	roughnessMap: texture_loader.load("./model/materials/carvalho/roughness.jpg"),
	roughness: 0.8,
	metalness: 0.5,
	name: "carvalho"
});

const pinho = new THREE.MeshStandardMaterial({
	map: texture_loader.load("./model/materials/pinho/color.jpg"),
	normalMap: texture_loader.load("./model/materials/pinho/normal.jpg"),
	roughnessMap: texture_loader.load("./model/materials/pinho/roughness.jpg"),
	roughness: .1,
	metalness: 0.6,
	normalScale: new THREE.Vector2(0.2, 0.2), // dimensions of normal map
	name: "pinho"
});

// TODO Alterar materiais
const material_txt = document.getElementById('material_txt');
const btn_pinho = document.getElementById('pinho');
btn_pinho.onclick = function(){
	objects_wood.forEach(object => {
		object.material = pinho;
	})
	textMaterial.innerText = 'Material: Pinho';
	material_txt.innerText = 'pinho';
	// console.log(pinho);
};

const btn_nogueira = document.getElementById('nogueira');
btn_nogueira.onclick = function(){
	objects_wood.forEach(object => {
		object.material = material_std;
	})
	textMaterial.innerText = 'Material: Nogueira';
	material_txt.innerText = 'nogueira';
};

const btn_carvalho = document.getElementById('carvalho');
btn_carvalho.onclick = function(){
	objects_wood.forEach(object => {
		object.material = carvalho;
	})
	textMaterial.innerText = 'Material: Carvalho';
	material_txt.innerText = 'carvalho';
	// console.log(carvalho);
};
