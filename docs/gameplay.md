# Gameplay

> A description of what the game does

Prologue
---

- The game is black with a spinning loading indicator
- Click the play button to replace the screen with the world

Environment
---

- You are a third-person wizard character
- You are on a hilly island with beaches and a cliff
- There are trees growing sporadically
- The sky is mid-sunset, cloudy

Things
---

- The player has a sword
- Green slimes regularly fall from the sky
- Earn points by killing slimes

---

What's Next
---

#### **Lock on** to enemies and **display** possible actions
- has a visual indicator around the enemy
- adjusts the main perspective somehow (?)
- show actions AND show controls, together

#### Implementation:
1. Camera frustum -> filter -> find nearest
2. Yank `sprite.position` from `enemy.position`
3. For every action:
    1. **Attack**: move towards enemy and swing sword
    2. **Intimidate**: shout at enemy, buffing their stats (?)
    - Create a child sprite
    - Increment angle by `(2*PI):radians / (actionCount):int;`
    - Crazy sin/cos/tan trigonometry shit

Things I can't work on yet
---
- **Sounds**: Need to find some, or ask John
- **Maps**: Long process, need time to work