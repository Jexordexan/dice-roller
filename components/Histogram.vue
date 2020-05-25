<template>
  <svg ref="svgRef" class="histogram"></svg>
</template>

<script lang="ts">
import { defineComponent, computed, watchEffect, ref, onMounted } from 'vue';
import * as d3 from 'd3';

import { runSimulation } from '../utils/diceRolling';

export default defineComponent({
  props: {
    expression: String,
    value: Number,
  },
  setup(props) {
    const svgRef = ref<SVGElement | null>(null);
    const margin = 40;
    let width = 400 - margin;
    let height = 150 - margin;

    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    function onResize() {}

    onMounted(() => {
      const svg = d3.select(svgRef.value);
      width = svg.node()?.clientWidth || 400;
      width -= margin;
      xScale.range([0, width]);

      const g = svg.append('g').attr('transform', `translate(${margin / 2}, ${margin / 2})`);

      // Add the X Axis
      g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      // Add the Y Axis
      // svg.append('g').attr('class', 'y axis').call(yAxis);
      g.append('line').attr('class', 'roll axis').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', height);
    });

    watchEffect(() => {
      if (!props.expression) return;
      const data = runSimulation(props.expression);
      const roll = props.value;

      const max = d3.max(data, (d) => d[1]) || 0;

      const svg = d3.select(svgRef.value).select('g');
      const domain = d3.extent(data, (d) => +d[0]) as [number, number];
      xScale.domain(domain);
      yScale.domain([0, max]);

      const rollX = xScale(roll || 0);

      svg
        .select('.x.axis') // change the x axis
        .transition()
        .duration(500)
        .call(xAxis);

      svg
        .select('.roll.axis') // change the x axis
        .transition()
        .duration(500)
        .attr('x1', rollX)
        .attr('x2', rollX);

      const bars = svg.selectAll('.bar').data(data);

      bars.exit().remove();

      const bandwidth = xScale(2) - xScale(1);

      bars
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(+d[0]) - bandwidth * 0.5)
        .attr('y', (d) => yScale(d[1]))
        .attr('width', bandwidth)
        .attr('height', (d) => height - yScale(d[1]));

      bars
        .transition()
        .duration(500)
        .attr('class', 'bar')
        .attr('x', (d) => xScale(+d[0]) - bandwidth * 0.5)
        .attr('y', (d) => yScale(d[1]))
        .attr('width', bandwidth)
        .attr('height', (d) => height - yScale(d[1]));
    });

    return {
      svgRef,
    };
  },
});
</script>

<style>
.histogram {
  width: 100%;
  height: 100%;
  color: #fff7;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.bar {
  fill: #29f2;
}

.roll.axis {
  stroke: #fec109;
}
</style>
