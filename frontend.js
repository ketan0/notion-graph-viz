async function visualizeGraph(graphData) {
  const width = 1000;
  const height = 1000;

  // const svg = d3.select('body').append('svg')
  //               .attr('width', width)
  //               .attr('height', height);

  const svg = d3.select("body")
                .append("svg")
                .attr("width", window.innerWidth)
                .attr("height", window.innerHeight);

  // If you want to make it responsive to window resize
  d3.select(window).on('resize', resize);


  const simulation = d3.forceSimulation(graphData.nodes)
                       .force('link', d3.forceLink(graphData.links).id(d => d.id))
                       .force('charge', d3.forceManyBody().strength(-500))
                       .force("collide", d3.forceCollide(100))
                       .force('center', d3.forceCenter(width / 2, height / 2));

  function resize() {
    const width = window.innerWidth, height = window.innerHeight;
    svg.attr("width", width).attr("height", height);
    simulation.force("center", d3.forceCenter(width / 2, height / 2))
    simulation.alphaTarget(0.3).restart();
    setTimeout(() => simulation.alphaTarget(0), 500);
  }

  const link = svg.append('g')
                  .selectAll('line')
                  .data(graphData.links)
                  .enter().append('line')
                  .attr('stroke', '#999')
                  .attr('stroke-opacity', 0.6);

  const node = svg.append('g')
                  .selectAll('g')
                  .data(graphData.nodes)
                  .enter().append('g');

  const nodeWidth = 100;
  const nodeHeight = 200;

  const circles = node.append("foreignObject")
                      .attr("width", nodeWidth)
                      .attr("height", nodeHeight)
                      .html(d => `<div style="font-weight: 700; border:1px solid #999; border-radius: 10px; padding: 10px; background-color: #191919; max-height: 100px; overflow: auto;">${d.name}</div>`)
                      .call(d3.drag()
                              .on('start', dragstarted)
                              .on('drag', dragged)
                              .on('end', dragended));

  // const circles = node.append('circle')
  //                     .attr('r', 5)
  //                     .attr('fill', '#69b3a2')
  //                     .call(d3.drag()
  //                             .on('start', dragstarted)
  //                             .on('drag', dragged)
  //                             .on('end', dragended));

  // function wrapText(text, width) {
  //   text.each(function() {
  //     var text = d3.select(this),
  //         words = text.text().split(/\s+/).reverse(),
  //         word,
  //         line = [],
  //         lineNumber = 0,
  //         lineHeight = 1.1,
  //         x = text.attr("x"),
  //         y = text.attr("y"),
  //         tspan = text.text(null).append("tspan").attr("x", x).attr("y", y);
  //     while (word = words.pop()) {
  //       line.push(word);
  //       tspan.text(line.join(" "));
  //       if (tspan.node().getComputedTextLength() > width) {
  //         line.pop();
  //         tspan.text(line.join(" "));
  //         line = [word];
  //         tspan = text.append("tspan").attr("x", x).attr("dy", lineHeight + "em").text(word);
  //       }
  //     }
  //   });
  // }

  // const labels = node.append('text')
  //                    .attr('x', d => d.x)
  //                    .attr('y', d => d.y-10)
  //                    .text(d => d.name)
  //                    .call(wrapText, 80); // call wrapText


  simulation.nodes(graphData.nodes)
            .on('tick', ticked);

  simulation.force('link')
            .links(graphData.links);

  function ticked() {
    link
      .attr('x1', d => d.source.x + nodeWidth/2)
      .attr('y1', d => d.source.y + 10)
      .attr('x2', d => d.target.x + nodeWidth/2)
      .attr('y2', d => d.target.y + 10);

    // node
    //   .attr('cx', d => d.x)
    //   .attr('cy', d => d.y);
    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })

    // labels
    //   .attr('x', d => d.x)
    //   .attr('y', d => d.y-10);
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}
window.addEventListener('DOMContentLoaded', async () => {
  let graphData;
  try {
    const res = await fetch('http://localhost:3000/fetchData');
    graphData = await res.json();
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
  // document.getElementById('data').textContent = JSON.stringify(graphData, null, 2);
  visualizeGraph(graphData);
});
