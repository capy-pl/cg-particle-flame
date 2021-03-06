# Particle Flame System

The project is a final project for computer graphic course in 2021 fall semester in National Chengchi University.

The project aims to build a volumetric flame using particle system. The volumetric flame is able to be rendered in 3D space, and is customizable in particle size, particle speed, texture, and its velocity. The projects is implemented using JavaScript, Three.js and some glsl shader.

The project is deployed as github page. Please refer to this [link](https://capy-pl.github.io/cg-particle-flame/).

## Preivew

![alt text](https://raw.githubusercontent.com/capy-pl/cg-particle-flame/master/public/volumetric_fire.gif)

## Install

Check following steps if you were to build this project in your local environment.

1. Clone the project
```bash
git clone git@github.com:capy-pl/cg-particle-flame.git
```

2. Install dependencies
```bash
# I use yarn as package manager
yarn
```

3. Start the development server
```bash
yarn start
```

The script will automatically open your default browser now, you should see the project. If not, enter ```localhost:3000``` in your browser.

## References

These are some projects that I studied before I implemented my version. They are all really nice projects if you were to implement your own version, make sure you see these projects before.

1. https://dl.acm.org/doi/10.1145/1230100.1230131
2. http://webgl-fire.appspot.com/html/fire.html
3. https://github.com/ethanhjennings/webgl-fire-particles
4. https://github.com/neungkl/fire-simulation
5. https://github.com/yomotsu/VolumetricFire
