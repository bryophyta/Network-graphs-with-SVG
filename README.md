# Network graphs with SVG 

A utility for drawing network graphs with SVG, written in TypeScript.

Consists of class definitions for Graph and for GraphNode. GraphNode is a class used by the Graph object to keep track of the graph structure. To draw or analyse your graph, create a new Graph instance and pass it data either through the constructor or through subsequent method calls.

The essential parameter is the canvas, which should be an <svg> element, and which is passed to the constructor as an HTML element.

Nodes and edges can added in the following ways:

    1. Passed as arrays to the constructor:
            * nodes: [{id, [x, y, strokeColor, fillColor]}, ...]
            * edges: [{source: 'sourceId', target: 'targetId'}, ...]
    2. Added using Graph.addNode(id, [x, y, strokeColor, fillColor]) or Graph.addEdge({source: 'sourceId', target: 'targetId'}).
    3. Alternatively generateRandomNetwork(n, p) can be used to generate random networks with n nodes, and probability p of any two nodes being connected.