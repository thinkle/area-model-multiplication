<script>
  import { floatToFrac, fracToFloat, getFrac } from "./Numbers.js";
  let atext = "2 1/2";
  let btext = "1 1/2";
  let a = atext;
  let b = btext;
  $: a = fracToFloat(atext);
  $: b = fracToFloat(btext);

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
  let unitSize = 90;
  $: unitSize = Math.min(75 / hmax, 75 / vmax);
  let vfrac = 1;
  let hfrac = 1;
  $: vfrac = getFrac(btext);
  $: hfrac = getFrac(atext);
</script>

<section>
	Type to Change the Problem and update the area model below:
	<h1>
		

  <span contenteditable="true" bind:textContent={btext} /> &times;
  <span contenteditable="true" bind:textContent={atext} /> = {floatToFrac(
    a * b, {denominators:[vfrac,hfrac,hfrac*vfrac]}
  )}
	</h1>
</section>
<div class="grid" style:--a={a} style:--b={b} style:--unit={`calc(min(${unitSize}vw,${unitSize}vh))`}>
	<div class="toplabel">
		{atext}
	</div>
	<div class="sidelabel">
		{btext}		
	</div>
	<div class="container"  >
  <div class="unit-container">
    {#each range(vmax) as v}
      <div class="row">
        {#each range(hmax) as h}
          <div class="unit">
            {#each range(vfrac) as vf}
              <div class="row">
                {#each range(hfrac) as hf}
                  <div class="fracpart">
										{#if hfrac > 1 || vfrac > 1} 
										{floatToFrac(
    1/(hfrac*vfrac), {denominators:[vfrac,hfrac,hfrac*vfrac]}
  )}

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
  <div class="problem"  />
</div>
</div>




<style>
	section {
		text-align: center;
	}
	.grid {
		grid-template-areas : 
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
		background-color: #333;
		color: white;
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
		background-color: #333;
		color: white;
		height: calc(var(--unit) * var(--b));
		margin-right: 1em;
				transition: all 300ms;
		
	}
	
	h1 span {
		text-decoration: underline;
		min-width: 2em;
		display: inline-block;
		text-align: center;
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
			display: grid;
			place-content: center;
			font-size: calc(var(--unit)/6);
			overflow: hidden;
	}
  .unit {
    background-color: #eee;
    width: var(--unit);
    height: var(--unit);
    border: 3px solid #111;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
				transition: all 300ms;
  }
  .problem {
    position: absolute;
    top: 0;
    background-color: #f008;
    width: calc(var(--unit) * var(--a));
    height: calc(var(--unit) * var(--b));
				transition: all 300ms;
  }
</style>
