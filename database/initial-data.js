let {
  Level
} = require('./models')

async function initLevel(size, goal = 'collectStars') {

  if (!await Level.exists({
      name: "test level"
    })) {

    console.log('\x1b[37m%s\x1b[0m', 'Creating test level...')

    let colors = ['red', 'white', 'blue', 'green']
    let blocks = []
    let stars = []
    let hero = {
      position: [0, 0],
      direction: 0
    }
    let allowedCommands = [
      'step',
      'left',
      'right',
      'paint',
      'if',
      'loop',
    ]

    // Creating blocks with randomized colors
    // In case of goal == 'collectStars' randomly place stars on the level
    for (let i = 0; i < size * size; i++) {
      let position = [
        i % size,
        Math.floor(i / size)
      ]
      blocks.push({
        color: colors[Math.round(Math.random() * 3)],
        position
      })
      // Randomized star placement
      if (goal == 'collectStars' && Math.round(Math.random() * 0.8))
        stars.push({
          position
        })
    }

    level = {
      name: 'test level',
      goal,
      blocks,
      hero,
      allowedCommands
    }

    if (goal == 'collectStars')
      level.stars = stars
    else
      level.goalPosition = [size - 1, size - 1]

    Level.create(level, function (err) {
      if (err) {
        console.log('\x1b[31m%s\x1b[0m', err.message)
        return
      } else
      console.log('\x1b[32m%s\x1b[0m', 'successfuly created a new test level');
    })
  } else
  console.log('\x1b[33m%s\x1b[0m', 'Test level already exists');
}

module.exports = {
  initLevel
}