<script lang="ts">
  interface Props {
    icon: string;
    hue: number;
  }

  let { icon, hue }: Props = $props();
</script>

<!-- .back is the size container; cqi units only resolve inside it. -->
<div class="back" style:--hue={hue}>
  <div class="frame">
    <span class="emblem" aria-hidden="true">{icon}</span>
  </div>
</div>

<style>
  .back {
    position: relative;
    container-type: size;
    width: 100%;
    height: 100%;
    border-radius: var(--card-radius);
    background:
      repeating-linear-gradient(45deg, rgb(255 255 255 / 0.07) 0 6px, transparent 6px 12px),
      repeating-linear-gradient(-45deg, rgb(255 255 255 / 0.07) 0 6px, transparent 6px 12px),
      hsl(var(--hue) 45% 42%);
    border: 1px solid hsl(var(--hue) 45% 32%);
    box-shadow: var(--shadow-sm);
  }

  .frame {
    position: absolute;
    inset: 7cqi;
    display: grid;
    place-items: center;
    border: 1.5px solid rgb(255 255 255 / 0.4);
    border-radius: calc(var(--card-radius) * 0.6);
  }

  .emblem {
    display: grid;
    place-items: center;
    width: 42cqi;
    aspect-ratio: 1;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.92);
    box-shadow: 0 0 0 4cqi rgb(255 255 255 / 0.15);
    font-size: 22cqi;
    line-height: 1;
  }
</style>
