(async () => {
  const LVL = await fetch("/lvl.json").then((a) => a.json());
  const canvas = document.querySelector("#wojsko");
  const ctx = canvas.getContext("2d");
  // const dpi = window.devicePixelRatio || 1
  const mouse = { x: 0, y: 0 };
  const size = 20,
    maxLvl = 5,
    speed = 0.6,
    renewSpeed = 2000,
    wayColor = "#ddd",
    textColor = "black",
    arrowColor = "rgba(26, 209, 255,0.7)";
  let cw = 400,
    ch = 600;
  canvas.addEventListener("mousemove", (e) => {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
  });
  const isInCircle = (point, circle) =>
    Math.sqrt((point.x - circle.x) ** 2 + (point.y - circle.y) ** 2) <
    circle.radius;
  let cursor = false;
  const setCursor = () => {
    canvas.style.cursor = cursor ? "pointer" : "context-menu";
  };

  const SETLVL = (_lvl = 1) => {
    if (_lvl - 1 === LVL.length) {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(0, 0, cw, ch);
      ctx.font = `${25}px Arlia`;
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Wygrałeś grę !!! Czekaj na więcej", cw / 2, ch / 2 - 10);
      return;
    }
    const { joint, positions } = LVL[_lvl - 1];
    const balls = [];
    const inter = [];
    let wayLine = [];
    let countUnits = [];
    let time = 600;
    positions.forEach((v) => {
      balls.push(new Ball(v[0], v[1], v[2], v[3], v[4]));
    });
    const pit = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    const showUnits = (a, b = 1) => countUnits.push([a, b]);
    const convertId = (a) => balls.filter((v) => a.includes(v.id));
    const clickNextLvl = (a = 1, b = false) => {
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(0, 0, cw, ch);
      ctx.font = `${25}px Arlia`;
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let text1 = b ? "Wygrałeś" : "Przegrałeś ;(";
      let text = b ? "Dalej ->" : "Jeszcze raz";
      ctx.fillText(text1, cw / 2, ch / 2 - 10);
      ctx.font = `${15}px Arlia`;
      ctx.fillText(text, cw / 2, ch / 2 + 10);
      cursor = true;
      setCursor();
      canvas.onclick = () => {
        if (b) {
          SETLVL(a + 1);
        } else {
          SETLVL(a);
        }
        canvas.onclick = () => {};
      };
      inter.forEach((v) => {
        clearInterval(v);
      });
    };
    const makeLine = () => {
      wayLine = wayLine
        .map((v) => {
          const [a, b, c = 1, t, col] = v;
          const pt = pit(a, b);
          const gox = (-(a.x - b.x) * speed) / pt;
          const goy = (-(a.y - b.y) * speed) / pt;
          const all = a.x + gox * c;
          const bll = a.y + goy * c;
          ctx.beginPath();
          ctx.arc(all, bll, 6, 0, 2 * Math.PI);
          ctx.fillStyle = col;
          ctx.fill();
          ctx.closePath();
          ctx.strokeStyle = "black";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(all, bll, 6, 0, 2 * Math.PI);
          ctx.stroke();
          if (
            Math.abs(a.x + gox * c - b.x) < speed &&
            Math.abs(a.y + goy * c - b.y) < speed
          ) {
            if (t === b.team) {
              b.units++;
              showUnits(b, "+1");
            } else {
              showUnits(b, "-1");
              b.units--;
              if (b.units < 0) {
                b.team = t;
                b.lvl = 1;
                b.units = -b.units;
              }
            }
            return null;
          } else {
            return [a, b, c + 1, t, col];
          }
        })
        .filter((v) => v);
      countUnits = countUnits
        .map((v) => {
          const [a, b, c = 0] = v;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `${15}px Arlia bold`;
          ctx.fillStyle = "red";
          ctx.fillText(b, a.x, a.y - c);
          if (c === 40) {
            return null;
          } else {
            return [a, b, c + 1];
          }
        })
        .filter((v) => v);
    };
    const attack = (a, b) => {
      const q = Math.floor(a.units / 2);
      showUnits(a, `-${q}`);
      a.units -= q;
      for (let i = 0; i < q; i++) {
        setTimeout(
          (wayLine) => {
            wayLine.push([a, b, 0, a.team, a.color]);
          },
          250 * i,
          wayLine
        );
      }
    };
    const setBackground = () => {
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = "#42a832";
      ctx.fillRect(0, 0, cw, ch);
      ctx.font = `${15}px Arlia`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Poziom ${_lvl}`, cw - 50, 20);
      ctx.font = `${20}px Arlia`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let sek = time % 60;
      let min = (time - sek) / 60;
      sek = sek < 10 ? "0" + sek : sek;
      min = min < 10 ? "0" + min : min;
      ctx.fillText(`${min}:${sek}`, cw / 2, 20);
    };
    const checkStatus = () => {
      let a = balls.map((v) => v.team);
      let b = wayLine.map((v) => v[3]);
      if ((!a.some((v) => v === 1) && !b.some((v) => v === 1)) || time === 0) {
        setTimeout(() => {
          clickNextLvl(_lvl, false);
        }, 1000);
        return;
      }
      if (!a.some((v) => v === 2) && !b.some((v) => v === 2) && time > 0) {
        setTimeout(() => {
          clickNextLvl(_lvl, true);
        }, 1000);
        return;
      }
      window.requestAnimationFrame(paint);
    };
    const enemy = () => {
      let e1 = balls.filter((v) => v.team === 2);
      e1.forEach((v) => {
        const { lvl, units, connect } = v;
        const ballsConected = convertId(connect);
        const ballsNotFriend = ballsConected.filter((va) => va.team !== 2);
        const ballsOnlyEnemy = ballsConected.filter((va) => va.team === 1);
        //   const emptyAroundEvery = ballsConected.every(va => va.team === 0)
        const emptyAroundSome = ballsConected.some((va) => va.team === 0);
        const enemyAroundSome = ballsConected.some((va) => va.team === 1);
        //   const friendAroundSome = ballsConected.some(va => va.team === 2)
        //   const friendAroundEvery = ballsConected.every(va => va.team === 2)
        //   const mini = Math.min.apply(
        //     null,
        //     ballsConected.map(v => v.units)
        //   )
        //   const maxi = Math.max.apply(
        //     null,
        //     ballsConected.map(v => v.units)
        //   )
        const attackSafely = (a, b) => {
          if (a.units - 5 > b.units) {
            let un = Math.floor(Math.log2(a.units - 5));
            for (let i = 0; i < un; i++) {
              attack(a, b);
            }
          }
        };
        const findLeast = (a) => {
          let b = a.map((va) => va.units);
          let c = Math.min.apply(null, b);
          return a.find((va) => va.units === c);
        };
        if (lvl === 5) {
          if (ballsConected.length === 1) {
            if (enemyAroundSome || emptyAroundSome) {
              attackSafely(v, ballsConected[0]);
            } else {
              attack(v, ballsConected[0]);
            }
            return;
          }
          if (enemyAroundSome || emptyAroundSome) {
            attackSafely(v, findLeast(ballsNotFriend));
            return;
          }
          attack(v, findLeast(ballsConected));
          return;
        }
        if (!enemyAroundSome) {
          lvlUp(v);
          return;
        } else {
          let findBall = findLeast(ballsOnlyEnemy);
          if (findBall.units < units - lvl * 5 + 4) {
            lvlUp(v);
            return;
          }
        }
        ballsNotFriend.forEach((va) => {
          attackSafely(v, va);
          return;
        });
        if (units === 50) {
          attack(v, findLeast(ballsConected));
        }
      });
    };
    const lvlUp = (a) => {
      if (a.lvl * 5 <= a.units && a.lvl < maxLvl) {
        showUnits(a, `-${a.lvl * 5}`);
        a.units -= a.lvl * 5;
        a.lvl++;
        a.update();
        clearInterval(a.up);
        a.up = setInterval(() => {
          a.units = a.units >= a.maxUnits ? a.units : a.units + 1;
        }, a.timeRenew);
        inter.push(a.up);
      }
    };
    const setWay = () => {
      joint.forEach((v) => {
        let n1 = balls.find((va) => va.id === v[0]);
        let n2 = balls.find((va) => va.id === v[1]);
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.strokeStyle = "black";
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.strokeStyle = wayColor;
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      });
    };
    function Ball(x = 0, y = 0, team = 0, id = null, lvl = 1) {
      this.x = x;
      this.y = y;
      this.team = team; // 0=nijakie,1=dobre,2=przeciwnik
      this.radius = size;
      this.id = id;
      this.lvl = lvl;
      this.units = lvl * 10;
      this.drag = false;
      this.hover = false;
      this.connect = joint
        .filter((v) => v.includes(this.id))
        .flatMap((v) => v)
        .filter((v) => v !== this.id);
      this.timeRenew = renewSpeed;
      this.update = function () {
        this.maxUnits = this.lvl * 10;
        this.timeRenew = renewSpeed - this.lvl * 200;
        this.color =
          this.team === 1 ? "blue" : this.team === 2 ? "red" : "#ddd";
      };
      this.up = setInterval(() => {
        this.units = this.units >= this.maxUnits ? this.units : this.units + 1;
      }, this.timeRenew);
      inter.push(this.up);
      this.border = function () {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, 2 * Math.PI);
        ctx.stroke();
        cursor = true;
      };
      this.arrow = function () {
        ctx.beginPath();
        ctx.lineWidth = 15;
        ctx.strokeStyle = arrowColor;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        cursor = true;
        this.border();
      };
      this.circle = function () {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.font = `${15}px Arlia`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.units, this.x, this.y + size / 2);
        ctx.font = `${25}px Arlia`;
        ctx.fillText(this.lvl, this.x, this.y - size / 4);
      };
      this.draw = function () {
        this.update();
        if (this.drag) {
          this.arrow();
        }
        this.circle();
        if (isInCircle(mouse, this)) {
          this.border();
        }
      };
      canvas.addEventListener("mousedown", () => {
        if (this.team !== 1) {
          return;
        }
        if (!isInCircle(mouse, this)) {
          return;
        }
        this.drag = true;
        canvas.addEventListener("mousemove", () => {
          this.connect.forEach((v) => {
            let n = balls.find((va) => va.id === v);
            if (isInCircle(mouse, n)) {
              mouse.x = n.x;
              mouse.y = n.y;
              canvas.onmouseup = () => {
                attack(this, n);
              };
            }
          });
        });
        canvas.onmouseup = () => {
          if (!isInCircle(mouse, this)) {
            return;
          }
          lvlUp(this);
        };
      });
      canvas.addEventListener("mouseup", () => {
        this.drag = false;
      });
    }
    const reset = () => {
      cursor = false;
      const width = canvas.parentElement.offsetWidth;
      canvas.style.transform = `scale(${
        width < 400 ? canvas.parentElement.offsetWidth / 400 : 1
      })`;
      canvas.width = cw;
      canvas.height = ch;
    };
    const paint = () => {
      reset();
      setBackground();
      setWay();
      makeLine();
      balls.forEach((v) => {
        v.draw();
      });
      setCursor();
      checkStatus();
    };
    paint();
    inter.push(
      setInterval(() => {
        balls.forEach((v) => {
          if (v.units > v.maxUnits) {
            v.units--;
            showUnits(v, `-1`);
          }
        });
      }, 2000)
    );
    inter.push(setInterval(enemy, 500));
    inter.push(
      setInterval(() => {
        if (time > 0) {
          time--;
        }
      }, 1000)
    );
  };
  SETLVL();
})();
