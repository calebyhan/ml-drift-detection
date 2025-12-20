'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

interface TimeSeriesChartProps {
  data: { week: number; value: number }[];
  referenceData?: { week: number; value: number }[];
  width?: number;
  height?: number;
  title?: string;
  yLabel?: string;
  showThreshold?: boolean;
  thresholdValue?: number;
}

export function TimeSeriesChart({
  data,
  referenceData,
  width = 600,
  height = 250,
  title = 'Time Series',
  yLabel = 'Value',
  showThreshold = false,
  thresholdValue = 0.1,
}: TimeSeriesChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = { top: 30, right: 30, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Scales
    const allData = referenceData ? [...data, ...referenceData] : data;
    const xExtent = d3.extent(allData, d => d.week) as [number, number];
    const yMax = Math.max(d3.max(allData, d => d.value) || 0, thresholdValue * 1.2);

    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .attr('fill', '#6b7280')
      .attr('text-anchor', 'middle')
      .text('Week');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('fill', '#6b7280')
      .attr('text-anchor', 'middle')
      .text(yLabel);

    // Threshold line
    if (showThreshold) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(thresholdValue))
        .attr('y2', yScale(thresholdValue))
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.7);

      g.append('text')
        .attr('x', innerWidth - 5)
        .attr('y', yScale(thresholdValue) - 5)
        .attr('text-anchor', 'end')
        .attr('fill', '#ef4444')
        .attr('font-size', '12px')
        .text(`Threshold: ${thresholdValue}`);
    }

    // Line generator
    const line = d3.line<{ week: number; value: number }>()
      .x(d => xScale(d.week))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Reference line (if provided)
    if (referenceData) {
      const refPath = g.append('path')
        .datum(referenceData)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2)
        .attr('opacity', 0.5)
        .attr('d', line);

      const refLength = refPath.node()?.getTotalLength() || 0;
      refPath
        .attr('stroke-dasharray', `${refLength} ${refLength}`)
        .attr('stroke-dashoffset', refLength)
        .transition()
        .duration(1000)
        .attr('stroke-dashoffset', 0);
    }

    // Main line
    const mainPath = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    const pathLength = mainPath.node()?.getTotalLength() || 0;
    mainPath
      .attr('stroke-dasharray', `${pathLength} ${pathLength}`)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Data points
    g.selectAll('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d.week))
      .attr('cy', d => yScale(d.value))
      .attr('r', 0)
      .attr('fill', d => d.value >= thresholdValue && showThreshold ? '#ef4444' : '#3b82f6')
      .transition()
      .delay((_, i) => i * (1500 / data.length))
      .duration(200)
      .attr('r', 4);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-medium fill-gray-800')
      .text(title);

  }, [data, referenceData, width, height, innerWidth, innerHeight, margin, title, yLabel, showThreshold, thresholdValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-4"
    >
      <svg ref={svgRef} width={width} height={height} />
    </motion.div>
  );
}
