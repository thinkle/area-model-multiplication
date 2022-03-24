<script>
  import { fade, fly } from "svelte/transition";
  import { floatToFrac, fracToFloat, getFrac } from "./Numbers.js";
  let atext = "1 1/2"; //"3 2/3";
  let btext = "2 1/4"; // "2 1/2";
  let a = atext;
  let b = btext;
  $: a = fracToFloat(atext);
  $: b = fracToFloat(btext);
  let problem;
  $: problem = `${a}*${b}=${a * b}`;
  let vmax;
  let hmax;
  $: vmax = Math.ceil(b);
  $: hmax = Math.ceil(a);
  function range(n) {
    let l = [];
    for (let i = 0; i < n; i++) {
      l.push(i);
    }
    return l;
  }
  let vv = [];
  let hh = [];
  $: vv = range(vmax);
  $: hh = range(hmax);
  $: console.log(hh, vv);
  let unitSize = 75;
  $: unitSize = Math.min(75 / hmax, 75 / vmax);
  let vfrac = 1;
  let hfrac = 1;
  $: vfrac = getFrac(btext);
  $: hfrac = getFrac(atext);

  let isNew = true;

  $: isNew = a || b || true;
  let solve = false;
  $: if (isNew) {
    solve = false;
  }

  let squareCounts = {};
  let flyingFractions = {};
  let extraCounts = [];

  function calculateFlyingFractions(a, b) {
    // How do we think about remainders...
    // let's go backwards and fill up...
    let parts = hfrac * vfrac;
    let fractionCount = 0;
    let squareCount = 0;
    let countemUp = {};
    let extras = [];
    extraCounts = [];
    flyingFractions = {};
    let completeWidth = Math.floor(a) * hfrac;
    let completeHeight = Math.floor(b) * vfrac;
    for (let row = 1; row <= vfrac * b; row++) {
      for (let col = 1; col <= hfrac * a; col++) {
        if (row > completeHeight || col > completeWidth) {
          fractionCount += 1;
          let coord = `${row}-${col}`;
          countemUp[coord] = fractionCount;
          extras.push(coord);
          flyingFractions[coord] = coord; // make us all flyers!
        }
      }
    }
    if (fractionCount >= parts) {
      let destinationCoords = [];
      for (let integerCol = 0; integerCol < Math.ceil(a); integerCol++) {
        for (let integerRow = 0; integerRow < Math.ceil(b); integerRow++) {
          if (integerRow + 1 <= b && integerCol + 1 <= a) {
            //console.log("Already full!", integerRow, integerCol);
            squareCount += 1;
          } else {
            // Now let's move these babies...
            let coords = [];
            for (
              let fracrow = 1 + integerRow * vfrac;
              fracrow < 1 + (integerRow + 1) * vfrac;
              fracrow++
            ) {
              for (
                let fraccol = 1 + integerCol * hfrac;
                fraccol < 1 + (integerCol + 1) * hfrac;
                fraccol++
              ) {
                coords.push(`${fracrow}-${fraccol}`);
              }
            }
            let alreadyHave = coords.filter((c) => extras.indexOf(c) > -1);
            let need = [];
            for (let c of coords) {
              if (!alreadyHave.includes(c)) {
                //console.log("Need", c);
                need.push(c);
              } else {
                delete flyingFractions[c];
                //console.log("Have", c);
              }
            }
            if (
              !destinationCoords.length ||
              need.length <=
                extras.length - alreadyHave.length - destinationCoords.length
            ) {
              extraCounts.push({ integerRow, integerCol });
              destinationCoords = [...destinationCoords, ...need];
              extras = extras.filter((c) => !alreadyHave.includes(c));
            }
          }
        }
      }
      for (let c of destinationCoords) {
        let source = extras.pop();
        flyingFractions[source] = c;
      }
    }

    console.log(fractionCount, countemUp, flyingFractions);
    for (let c of extraCounts) {
      squareCount += 1;
      c.count = squareCount;
    }
    flyingFractions = flyingFractions;
  }

  function calculateSquareCounts(a, b) {
    squareCounts = {};
    // A is across, B is down...
    if (a < 1 || b < 1) {
      // No full unit squares if either one is less than 1
      return;
    }
    let count = 0;
    // Otherwise, let's check...
    for (let col = 1; col <= a; col++) {
      for (let row = 1; row <= b; row++) {
        count += 1;
        squareCounts[`${row}-${col}`] = count;
      }
    }
    console.log(squareCounts);
  }

  function getBorderCrossings(a, b) {
    if (!a || !b) {
      return null;
    }
    let [arow, acol] = a.split("-").map(Number);
    let [brow, bcol] = b.split("-").map(Number);
    let vcrossings =
      Math.floor((brow - 1) / vfrac) - Math.floor((arow - 1) / vfrac);
    let hcrossings =
      Math.floor((bcol - 1) / hfrac) - Math.floor((acol - 1) / hfrac);
    return {
      h: hcrossings,
      v: vcrossings,
    };
  }

  let ignoreGlobalKeys = false;

  $: calculateSquareCounts(a, b);
  $: calculateFlyingFractions(a, b);
</script>

<main>
  <section>
    Type to change the multiplication problem and update the area model below:
    <h1>
      <span class="e b" contenteditable="true" bind:textContent={btext} />
      &times;
      <span class="e a" contenteditable="true" bind:textContent={atext} />
      =
      {#if solve}
        <span in:fade={{ delay: 2000 }} on:click={() => (solve = false)}
          >{floatToFrac(a * b, {
            denominators: range(1 + hfrac * vfrac).slice(1),
          })}
        </span>
      {:else}
        <button in:fade on:click={() => (solve = true)}> ? </button>
      {/if}
    </h1>
    {#if !isNew}
      <button in:fade out:fade class="fixed" on:click={() => (isNew = true)}
        >⟳</button
      >
    {/if}
  </section>
  <div
    class="grid"
    style:--a={a}
    style:--b={b}
    style:--total={a * b}
    style:--unit={`calc(min(${unitSize}vw,0.8*${unitSize}vh))`}
  >
    <div class="toplabel">
      {atext}
    </div>
    <div class="sidelabel">
      {btext}
    </div>
    {#key problem}
      <div class="container" class:solve>
        <div class="unit-container">
          {#each range(vmax) as v}
            <div class="row">
              {#each range(hmax) as h}
                {@const count = squareCounts[`${v + 1}-${h + 1}`]}
                <div class="unit">
                  {#if count}
                    <div class="count" style:--count={count}>
                      {count}
                    </div>
                  {/if}
                  {#each range(vfrac) as vf}
                    <div class="row" style:--vfrac={vfrac}>
                      {#each range(hfrac) as hf}
                        {@const row = v * vfrac + (vf + 1)}
                        {@const col = h * hfrac + (hf + 1)}
                        {@const coord = `${row}-${col}`}
                        {@const moving = flyingFractions[coord] && true}
                        {@const dest = flyingFractions[coord]}
                        {@const crossings = getBorderCrossings(coord, dest)}
                        <div
                          class="fracpart"
                          class:moving
                          style:--hfrac={hfrac}
                          style:--source-row={row}
                          style:--source-col={col}
                          style:--dest-row={dest?.split("-")[0]}
                          style:--dest-col={dest?.split("-")[1]}
                          style:--h-crossings={crossings?.h}
                          style:--v-crossings={crossings?.v}
                          {row}
                          {col}
                          moveTo={flyingFractions[coord]}
                        >
                          {#if hfrac > 1 || vfrac > 1}
                            {floatToFrac(1 / (hfrac * vfrac), {
                              denominators: [vfrac, hfrac, hfrac * vfrac],
                            })}
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/each}
                </div>
              {/each}
            </div>
          {/each}
        </div>
        <div
          class="problem"
          class:isNew
          on:animationend={() => (isNew = false)}
        />
        {#each extraCounts as extra}
          <div
            class="extra-count"
            style:--col={extra.integerCol}
            style:--row={extra.integerRow}
            style:--count={extra.count}
          >
            {extra.count}
          </div>
        {/each}
      </div>
    {/key}
  </div>
</main>

<style>
  main {
    --red: #ffe45c;
    --red-t: #ffe45caa;
    --blue: #2ecbe9;
    --blue-t: #2ecbe9aa;
    --purple: #91d356;
    --purple-t: #5b744477;
    --white: white;
    --black: black;
  }
  section {
    text-align: center;
  }
  .grid {
    --border-width: 3px;
    grid-template-areas:
      ". top"
      "side main";
    display: grid;
    place-content: center center;
  }
  .toplabel {
    grid-area: top;
    margin-right: auto;
    margin-bottom: 1em;
    width: calc(var(--unit) * var(--a));
    height: 2em;
    display: grid;
    place-content: center;
    background-color: var(--blue);
    color: var(--white);
    text-shadow: 1px 1px var(--black);
    text-align: center;
    transition: all 300ms;
  }
  .sidelabel {
    grid-area: side;
    place-content: start center;
    margin-bottom: auto;
    display: grid;
    place-content: center;
    min-width: 2em;
    background-color: var(--red);
    color: var(--black);
    text-shadow: 1px 1px var(--white);
    height: calc(var(--unit) * var(--b));
    margin-right: 1em;
    transition: all 300ms;
  }
  .extra-count {
    z-index: 3 !important;
    top: calc(var(--row) * var(--unit));
    left: calc(var(--col) * var(--unit));
  }
  h1 {
    margin: 0;
    margin-bottom: 5px;
  }
  h1 span.e {
    min-width: 2em;
    display: inline-block;
    text-align: center;
    padding: 0.2em;
    box-sizing: border-box;
    background-color: #eee;
  }
  .e.a {
    border-bottom: 6px solid var(--blue);
  }
  .e.b {
    border-bottom: 6px solid var(--red);
  }
  .container {
    position: relative;
    margin: auto;
    grid-area: main;
    align-self: center;
  }
  .unit-container {
    position: relative;
  }
  .row {
    display: flex;
    flex-direction: row;
  }
  .unit .row {
    height: 100%;
    display: flex;
    justify-content: space-around;
  }
  .fracpart {
    border: 1px dotted #888;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: grid;
    place-content: center;
    font-size: calc(var(--unit) / 6);
    overflow: hidden;
  }
  .unit {
    background-color: #eee;
    width: var(--unit);
    height: var(--unit);
    border: var(--border-width) solid #111;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    transition: all 300ms;
  }
  .unit {
    position: relative;
  }
  .count,
  .extra-count {
    position: absolute;
    width: var(--unit);
    height: var(--unit);
    display: grid;
    place-content: center;
    font-weight: bold;
    text-shadow: 1px 1px var(--white);
    font-size: calc(var(--unit) / 2);
    z-index: 2;
    opacity: 0;
  }
  .solve .count,
  .solve .extra-count {
    opacity: 1;
    transition: opacity 1s;
    transition-delay: calc(var(--count) * (2000ms / var(--total)));
  }
  .problem {
    position: absolute;
    top: 0;
    background-color: var(--purple-t);
    width: calc(var(--unit) * var(--a));
    height: calc(var(--unit) * var(--b));
    transition: all 300ms;
  }

  .isNew {
    animation: 3s reveal;
  }

  .moving {
    background-color: var(--purple);
    position: relative;
    z-index: 3;
  }

  @keyframes reveal {
    0% {
      opacity: 0;
      width: calc(var(--unit));
      height: 0;
      background-color: var(--red-t);
    }
    20% {
      opacity: 0;
      width: calc(var(--unit));
      height: 0;
    }
    40% {
      opacity: 1;
      width: calc(var(--unit));
      height: calc(var(--unit) * var(--b));
    }
    60% {
      opacity: 1;
      width: calc(var(--unit));
      height: calc(var(--unit) * var(--b));
      background-color: var(--red-t);
    }
    100% {
      opacity: 1;
      width: calc(var(--unit) * var(--a));
      height: calc(var(--unit) * var(--b));
      background-color: var(--purple-t);
    }
  }
  .fixed {
    position: fixed;
    right: 2em;
    top: 2em;
  }
  .moving.fracpart {
    position: relative;
    top: 0;
    left: 0;
    background-color: transparent;
  }
  .solve .moving.fracpart {
    --left-offset: calc(var(--dest-col) - var(--source-col));
    --top-offset: calc(var(--dest-row) - var(--source-row));
    /*  --h: calc((var(--unit) - (2 * var(--border-width))) / var(--hfrac));
    --v: calc((var(--unit) - (2 * var(--border-width))) / var(--vfrac));
    left: calc(
      var(--h) * var(--left-offset) + var(--h-crossings) * var(--border-width)
    );
    top: calc(
      var(--v) * var(--top-offset) + var(--v-crossings) * var(--border-width)
    ); */
    --inner-size: calc(var(--unit) - 2 * var(--border-width));
    --h: calc(var(--inner-size) / var(--hfrac));
    --v: calc(var(--inner-size) / var(--vfrac));
    top: calc(
      var(--v-crossings) * 2 * var(--border-width) + var(--v) *
        var(--top-offset)
    );
    left: calc(
      var(--h-crossings) * 2 * var(--border-width) + var(--h) *
        var(--left-offset)
    );
    transition: all 500ms;
    transition-delay: 2000ms;
    background-color: var(--purple);
  }
</style>
