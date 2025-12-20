'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface AnimatedHistogramProps {
  referenceData: number[];
  currentData: number[];
  bins: number[];
  width?: number;
  height?: number;
  title?: string;
  showLegend?: boolean;
  animationDuration?: number;
}

export function AnimatedHistogram({
  referenceData,
  currentData,
  bins,
  width = 400,
  height = 250,
  title = 'Distribution Comparison',
  showLegend = true,
  animationDuration = 750,
}: AnimatedHistogramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = { top: 30, right: 30, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (!svgRef.current || referenceData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create histogram data
    const histogram = d3.bin<number, number>()
      .domain([bins[0], bins[bins.length - 1]])
      .thresholds(bins.slice(1, -1));

    const refBins = histogram(referenceData);
    const curBins = histogram(currentData);

    // Normalize to proportions
    const refTotal = referenceData.length;
    const curTotal = currentData.length;
    
    const refProportions = refBins.map(b => b.length / refTotal);
    const curProportions = curBins.map(b => b.length / curTotal);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([bins[0], bins[bins.length - 1]])
      .range([0, innerWidth]);

    const yMax = Math.max(...refProportions, ...curProportions) * 1.1;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('class', 'text-gray-600');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${(d as number * 100).toFixed(0)}%`))
      .attr('class', 'text-gray-600');

    // Bar width
    const barWidth = innerWidth / (bins.length - 1) / 2 - 2;

    // Reference bars (blue)
    g.selectAll('.ref-bar')
      .data(refBins)
      .enter()
      .append('rect')
      .attr('class', 'ref-bar')
      .attr('x', (d) => xScale(d.x0!) - barWidth)
      .attr('width', barWidth)
      .attr('y', innerHeight)
      .attr('height', 0)
      .attr('fill', '#3b82f6')
      .attr('opacity', 0.7)
      .transition()
      .duration(animationDuration)
      .attr('y', (_, i) => yScale(refProportions[i]))
      .attr('height', (_, i) => innerHeight - yScale(refProportions[i]));

    // Current bars (orange)
    g.selectAll('.cur-bar')
      .data(curBins)
      .enter()
      .append('rect')
      .attr('class', 'cur-bar')
      .attr('x', (d) => xScale(d.x0!))
      .attr('width', barWidth)
      .attr('y', innerHeight)
      .attr('height', 0)
      .attr('fill', '#f97316')
      .attr('opacity', 0.7)
      .transition()
      .duration(animationDuration)
      .delay(animationDuration / 2)
      .attr('y', (_, i) => yScale(curProportions[i]))
      .attr('height', (_, i) => innerHeight - yScale(curProportions[i]));

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-medium fill-gray-800')
      .text(title);

  }, [referenceData, currentData, bins, width, height, innerWidth, innerHeight, margin, animationDuration, title]);

  return (
    <div className="bg-gray-50 rounded p-4">
      <svg ref={svgRef} width={width} height={height} />
      {showLegend && (
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-70" />
            <span>2011</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-orange-500 rounded-sm opacity-70" />
            <span>2012</span>
          </div>
        </div>
      )}
    </div>
  );
}
