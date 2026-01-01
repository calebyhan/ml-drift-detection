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
  const margin = { top: 20, right: 40, bottom: 40, left: 60 };
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

    // Get CSS variable values
    const root = document.documentElement;
    const style = getComputedStyle(root);
    const textSecondary = style.getPropertyValue('--text-secondary').trim() || '#64748b';
    const borderColor = style.getPropertyValue('--border').trim() || '#e2e8f0';

    // Add axes with proper styling
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5));

    xAxis.selectAll('text')
      .attr('fill', textSecondary)
      .style('font-size', '12px');

    xAxis.selectAll('line')
      .attr('stroke', borderColor);

    xAxis.select('.domain')
      .attr('stroke', borderColor);

    const yAxis = g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${(d as number * 100).toFixed(0)}%`));

    yAxis.selectAll('text')
      .attr('fill', textSecondary)
      .style('font-size', '12px');

    yAxis.selectAll('line')
      .attr('stroke', borderColor);

    yAxis.select('.domain')
      .attr('stroke', borderColor);

    // Bar width
    const barWidth = innerWidth / (bins.length - 1) / 2.5 - 3;

    // Reference bars (blue)
    g.selectAll('.ref-bar')
      .data(refBins)
      .enter()
      .append('rect')
      .attr('class', 'ref-bar')
      .attr('x', (d) => {
        const binCenter = (d.x0! + d.x1!) / 2;
        return xScale(binCenter) - barWidth - 2;
      })
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
      .attr('x', (d) => {
        const binCenter = (d.x0! + d.x1!) / 2;
        return xScale(binCenter) + 2;
      })
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

  }, [referenceData, currentData, bins, width, height, innerWidth, innerHeight, margin, animationDuration]);

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: 'var(--background)',
        border: '1px solid var(--border)'
      }}
    >
      <h4 className="text-sm font-semibold mb-4 text-center" style={{ color: 'var(--text)' }}>
        {title}
      </h4>
      <div className="flex justify-center">
        <svg ref={svgRef} width={width} height={height} />
      </div>
      {showLegend && (
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: 'rgb(59, 130, 246)',
                opacity: 0.8
              }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              2011 (Training)
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: 'rgb(249, 115, 22)',
                opacity: 0.8
              }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              2012 (Current)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
