// This Graph object is used to draw network graphs.
// The essential parameter is the canvas, which should be an <svg> element, and which is passed to the constructor as an HTML element.
// Nodes and edges can added in the following ways:
//        1. Passed as arrays to the constructor:
//                * nodes: [{id, [x, y, strokeColor, fillColor]}, ...]
//                * edges: [{source: 'sourceId', target: 'targetId'}, ...]
//        2. Added using Graph.addNode(id, [x, y, strokeColor, fillColor]) or Graph.addEdge({source: 'sourceId', target: 'targetId'}).
//        3. Alternatively generateRandomNetwork(n, p) can be used to generate random networks with n nodes, and probability p of any two nodes being connected.

"use strict";

class Graph {
    canvas: HTMLElement;
    nodes: GraphNode[];
    nodeIds: string[];
    nodeDictionary: { [k: string]: GraphNode };
    edges: { source: GraphNode; target: GraphNode }[];
    width: number;
    height: number;
    weightFactor: number;

    playing: boolean;

    primaryDark: string;
    primaryMid: string;
    primaryLight: string;
    secondaryDark: string;
    secondaryMid: string;
    tertiaryMid: string;

    constructor({
        canvas,
        nodes = [],
        edges = [],
        weightFactor = 1,
        primaryDark = "#90a4ae",
        primaryMid = "#b0bec5",
        primaryLight = "#fce4ec",
        secondaryDark = "#ffab91",
        secondaryMid = "#f06292",
        tertiaryMid = "#9575cd",
    }: {
        canvas: HTMLElement;
        nodes: { [k: string]: string }[];
        edges: { source: string; target: string }[];
        weightFactor: number;
        primaryDark: string;
        primaryMid: string;
        primaryLight: string;
        secondaryDark: string;
        secondaryMid: string;
        tertiaryMid: string;
    }) {
        this.canvas = canvas;
        this.nodes = [];
        this.nodeIds = [];
        this.nodeDictionary = {};
        this.edges = [];
        this.width = this.canvas?.clientWidth ?? 0;
        this.height = this.canvas?.clientHeight ?? 0;
        this.weightFactor = weightFactor;

        this.playing = false;

        //colour palette
        this.primaryDark = primaryDark;
        this.primaryMid = primaryMid;
        this.primaryLight = primaryLight;
        this.secondaryDark = secondaryDark;
        this.secondaryMid = secondaryMid;
        this.tertiaryMid = tertiaryMid;

        for (let node of nodes) {
            if (!this.nodeIds.includes(node.id)) {
                const newNode = new GraphNode({
                    id: node.id,
                    x:
                        node.x === undefined
                            ? Math.random() * (this.width - 20) + 10
                            : parseInt(node.x),
                    y:
                        node.y === undefined
                            ? Math.random() * (this.height - 20) + 10
                            : parseInt(node.y),
                    strokeColor: node.strokeColor ?? this.primaryDark,
                    fillColor: node.fillColor ?? this.primaryMid,
                });
                this.nodes.push(newNode);
                this.nodeIds.push(node.id); //keep Id list up to date
                this.nodeDictionary[node.id] = newNode; //keep node dictionary up to date
            }
        }

        edges
            .filter(
                (e) =>
                    this.nodeIds.includes(e.source) &&
                    this.nodeIds.includes(e.target)
            )
            .forEach((e) => {
                const newEdge: { source: GraphNode; target: GraphNode } = {
                    source: this.nodeDictionary[e.source],
                    target: this.nodeDictionary[e.target],
                };
                this.edges.push(newEdge);
            });
    }

    addNode({
        id,
        x = null,
        y = null,
        strokeColor = null,
        fillColor = null,
        label = "",
        displayLabel = false
    }: {
        id: string;
        x?: number | null;
        y?: number | null;
        strokeColor?: string | null;
        fillColor?: string | null;
        label?: string | null;
        displayLabel?: boolean | null;
    }) {
        if (!this.nodeIds.includes(id)) {
            const newNode = new GraphNode({
                id: id,
                x: x === null ? Math.random() * (this.width - 20) + 10 : x,
                y: y === null ? Math.random() * (this.height - 20) + 10 : y,
                strokeColor: strokeColor ?? this.primaryDark,
                fillColor: fillColor === null ? this.primaryMid : fillColor,
                label: label ?? '',
                displayLabel: displayLabel ?? false
            });
            this.nodes.push(newNode);
            this.nodeIds.push(id); //keep Id list up to date
            this.nodeDictionary[id] = newNode; //keep node dictionary up to date
            return newNode;
        } else {
            throw "A node already exists with that id.";
        }
        return new GraphNode({
            id: "",
            x: 0,
            y: 0,
            strokeColor: "",
            fillColor: "",
        });
    }

    addEdge({ source, target }: { source: string; target: string }) {
        if (this.nodeIds.includes(source)) {
            if (this.nodeIds.includes(target)) {
                const newEdge: { source: GraphNode; target: GraphNode } = {
                    source: this.nodeDictionary[source],
                    target: this.nodeDictionary[target],
                };
                this.edges.push(newEdge);
            } else {
                console.error(
                    `Graph does not include a node with id ${target}`
                );
            }
        } else {
            console.error(`Graph does not include a node with id ${source}`);
        }
    }

    deleteAllNodes() {
        this.nodes = [];
        this.edges = [];
        this.nodeIds = [];
        this.nodeDictionary = {};
    }


    // basic drawing functions
    drawLine({
        canvas,
        source,
        target,
        color,
        weight = 1,
    }: {
        canvas: HTMLElement;
        source: GraphNode;
        target: GraphNode;
        color: string;
        weight: number;
    }) {
        const ns = "http://www.w3.org/2000/svg";
        const line = document.createElementNS(ns, "line");
        line.setAttributeNS(null, "id", "edge" + source.id + target.id);
        line.setAttributeNS(null, "x1", source.x.toString());
        line.setAttributeNS(null, "y1", source.y.toString());
        line.setAttributeNS(null, "x2", target.x.toString());
        line.setAttributeNS(null, "y2", target.y.toString());
        line.setAttributeNS(null, "stroke", color);
        line.setAttributeNS(null, "stroke-width", weight.toString());
        canvas.appendChild(line);
    }

    drawCircle({
        canvas,
        x,
        y,
        id,
        weight,
        fillColor,
        strokeColor,
        label = "",
        displayLabel = false,
        highlighted = false,
        strokeWidth = 2,
    }: {
        canvas: HTMLElement;
        x: number;
        y: number;
        id: string;
        weight: number;
        fillColor: string;
        strokeColor: string;
        displayLabel?: boolean;
        highlighted?: boolean;
        strokeWidth?: number;
        label?: string;
    }) {
        const ns = "http://www.w3.org/2000/svg";
        const group = document.createElementNS(ns, "g");
        group.setAttributeNS(null, "class", "hoverPoint");
        group.setAttributeNS(null, "id", id);
        // group.addEventListener('mouseenter', this.m);
        // group.addEventListener('mouseleave', mouseOutPoint);

        const circle = document.createElementNS(ns, "circle");

        circle.setAttributeNS(null, "cx", x.toString());
        circle.setAttributeNS(null, "cy", y.toString());
        circle.setAttributeNS(null, "r", (weight * 2).toString());
        circle.setAttributeNS(null, "stroke", strokeColor);
        circle.setAttributeNS(null, "fill", fillColor);
        circle.setAttributeNS(null, "stroke-width", strokeWidth.toString());
        circle.setAttributeNS(null, "class", "point");
        circle.setAttributeNS(null, "id", "circle" + id);
        group.appendChild(circle);
        if (label != "") {
            const lab = document.createElementNS(ns, "text");
            lab.setAttributeNS(null, "x", (x + 7).toString());
            lab.setAttributeNS(null, "y", y.toString());
            lab.setAttributeNS(null, "id", "label" + id);
            lab.setAttributeNS(null, "class", displayLabel ? "show" : "hide");
            lab.innerHTML = label;
            group.appendChild(lab);
        }
        canvas.appendChild(group);
    }


    clear() {
        this.canvas.innerHTML = "";
    }

    draw() {
        this.edges.forEach((e) =>
            this.drawLine({
                canvas: this.canvas,
                source: e.source,
                target: e.target,
                color: this.primaryDark,
                weight: this.weightFactor,
            })
        );
        this.nodes.forEach((n) =>
            this.drawCircle({
                canvas: this.canvas,
                x: n.x,
                y: n.y,
                id: n.id,
                label: n.label,
                displayLabel: n.displayLabel,
                weight: n.weight * this.weightFactor,
                strokeColor: n.strokeColor,
                fillColor: n.fillColor,
            })
        );
    }

    drawNode(nodeId: string){
        const n = this.nodeDictionary[nodeId];
        this.drawCircle({
            canvas: this.canvas,
            x: n.x,
            y: n.y,
            id: n.id,
            label: n.label,
            displayLabel: n.displayLabel,
            weight: n.weight * this.weightFactor,
            strokeColor: n.strokeColor,
            fillColor: n.fillColor,
        });
    }

    refresh() {
        this.clear();
        this.draw();
    }

    arrangeInCircle() {
        const centreX = this.width / 2;
        const centreY = this.height / 2;
        const radius = Math.min(centreX, centreY) / 2;
        const nodeCount = this.nodes.length;
        for (let i = 0; i < nodeCount; i++) {
            this.nodes[i].x =
                centreX + radius * Math.cos(((2 * Math.PI) / nodeCount) * i);
            this.nodes[i].y =
                centreY + radius * Math.sin(((2 * Math.PI) / nodeCount) * i);
        }
    }

    arrangeRandomly() {
        for (let node of this.nodes) {
            node.x = Math.random() * (this.width - 20) + 10;
            node.y = Math.random() * (this.height - 20) + 10;
        }
    }

    // Some helper functions for fruchtermanReingold below
    fa(z: number, k: number, c: number): number {
        return (Math.pow(z, 2) / k) * c;
    }
    fr(z: number, k: number, c: number): number {
        return (Math.pow(k, 2) / z) * c;
    }
    dist(vector: { x: number; y: number }) {
        return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    }
    deltaF(a: number, b: number) {
        let dif = a - b;
        if (dif < 0) {
            return Math.min(dif, -0.0001);
        } else {
            return Math.max(dif, 0.0001);
        }
    }

    // The following is an implementation the Fruchterman-Reingold algorithm for node placement,
    // based on the pseudo-code for the algorithm provided in their 1991 paper.
    // You can find it here:
    // https://scholar.google.co.uk/scholar?hl=en&as_sdt=0%2C5&q=Fruchterman+Reingold.+Graph+drawing+by+force-directed+placement&btnG=
    // And then an 'animated' version below, which redraws after each step.
    fruchtermanReingold(attractionConstant: number, repulsionConstant: number) {
        const net = { nodes: this.nodes, edges: this.edges };
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        let k = Math.sqrt((width * height) / net.nodes.length);
        let t = 50;

        for (let i = 1; i < 80; i++) {
            //calculate displacement based on node repulsion
            for (let node of net.nodes) {
                node.disp = { x: 0, y: 0 };
                for (let otherNode of net.nodes) {
                    if (node != otherNode) {
                        let delta = {
                            x: this.deltaF(node.x, otherNode.x),
                            y: this.deltaF(node.y, otherNode.y),
                        };
                        let distanceDelta = this.dist(delta);
                        let newDispX =
                            node.disp.x +
                            (delta.x / distanceDelta) *
                                this.fr(distanceDelta, k, repulsionConstant);
                        let newDispY =
                            node.disp.y +
                            (delta.y / distanceDelta) *
                                this.fr(distanceDelta, k, repulsionConstant);

                        node.disp.x = newDispX;
                        node.disp.y = newDispY;
                    }
                }
            }

            //calculate displacement based on node attraction (for nodes sharing an edge)
            for (let edge of net.edges) {
                const source = edge.source;
                const target = edge.target;
                let delta = {
                    x: this.deltaF(source.x, target.x),
                    y: this.deltaF(source.y, target.y),
                };
                let distanceDelta = this.dist(delta);
                source.disp.x =
                    source.disp.x -
                    (delta.x / distanceDelta) *
                        this.fa(distanceDelta, k, attractionConstant);
                source.disp.y =
                    source.disp.y -
                    (delta.y / distanceDelta) *
                        this.fa(distanceDelta, k, attractionConstant);
                target.disp.x =
                    target.disp.x +
                    (delta.x / distanceDelta) *
                        this.fa(distanceDelta, k, attractionConstant);
                target.disp.y =
                    target.disp.y +
                    (delta.y / distanceDelta) *
                        this.fa(distanceDelta, k, attractionConstant);
            }

            for (let node of net.nodes) {
                const tempX =
                    node.x +
                    (node.disp.x / this.dist(node.disp)) *
                        Math.min(Math.abs(node.disp.x), t);
                const tempY =
                    node.y +
                    (node.disp.y / this.dist(node.disp)) *
                        Math.min(Math.abs(node.disp.y), t);

                node.x = Math.min(width - 10, Math.max(10, tempX));
                node.y = Math.min(height - 10, Math.max(20, tempY));
            }
            t = t - 10 / i;
        }
        this.refresh();
    }

    async fruchtermanReingoldAnimate(
        attractionConstant: number,
        repulsionConstant: number
    ) {
        this.playing = true;
        const net = { nodes: this.nodes, edges: this.edges };
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        let k = Math.sqrt((width * height) / net.nodes.length);
        let t = 50;

        for (let i = 1; i < 80; i++) {
            if (!this.playing) break;
            //calculate displacement based on node repulsion
            for (let node of net.nodes) {
                node.disp = { x: 0, y: 0 };
                for (let otherNode of net.nodes) {
                    if (node != otherNode) {
                        let delta = {
                            x: this.deltaF(node.x, otherNode.x),
                            y: this.deltaF(node.y, otherNode.y),
                        };
                        let distanceDelta = this.dist(delta);
                        let newDispX =
                            node.disp.x +
                            (delta.x / distanceDelta) *
                                this.fr(distanceDelta, k, repulsionConstant);
                        let newDispY =
                            node.disp.y +
                            (delta.y / distanceDelta) *
                                this.fr(distanceDelta, k, repulsionConstant);

                        node.disp.x = newDispX;
                        node.disp.y = newDispY;
                    }
                }
            }

            for (let edge of net.edges) {
                const source = edge.source;
                const target = edge.target;
                let delta = {
                    x: this.deltaF(source.x, target.x),
                    y: this.deltaF(source.y, target.y),
                };
                let distanceDelta = this.dist(delta);
                source.disp.x =
                    source.disp.x -
                    (delta.x / distanceDelta) *
                        this.fa(distanceDelta, k, attractionConstant);
                source.disp.y =
                    source.disp.y -
                    (delta.y / distanceDelta) *
                        this.fa(distanceDelta, k, attractionConstant);
                target.disp.x =
                    target.disp.x +
                    (delta.x / distanceDelta) *
                        this.fa(distanceDelta, k, attractionConstant);
                target.disp.y =
                    target.disp.y +
                    (delta.y / distanceDelta) *
                        this.fa(distanceDelta, k, attractionConstant);
            }

            for (let node of net.nodes) {
                const tempX =
                    node.x +
                    (node.disp.x / this.dist(node.disp)) *
                        Math.min(Math.abs(node.disp.x), t);
                const tempY =
                    node.y +
                    (node.disp.y / this.dist(node.disp)) *
                        Math.min(Math.abs(node.disp.y), t);
                // there's no mention of using the absolute value in the pseudo-code that I'm working from, but unless you include it it'll always pick a negative value over t, with the Math.min() function, but then the two negatives will cancel each other out when you multiply disp by disp. *Possibly* this is accounted for in the original by the fact that they seem to take (0,0) to be the centre of the canvas, rather than the top left corner as it is for me, though if that is how it works I can't quite work out why it would be the case...
                node.x = Math.min(width - 20, Math.max(20, tempX));
                node.y = Math.min(height - 20, Math.max(20, tempY));
            }
            t = t - 10 / i;
            this.refresh();
            await new Promise((r) => setTimeout(r, 200));
        }
        this.playing = false;
    }

    // Some functions to generate and analyse networks

    containsNode(
        edge: { source: GraphNode; target: GraphNode },
        node: GraphNode
    ) {
        return edge.source === node || edge.target === node;
    }

    degree(nodeId: string) {
        const node = this.nodeDictionary[nodeId];
        let degreeCounter = 0;
        for (let edge of this.edges) {
            if (this.containsNode(edge, node)) degreeCounter++;
        }
        return degreeCounter;
    }

    averageDegree() {
        let runningTotal = 0;
        for (let nodeId of this.nodeIds) {
            runningTotal += this.degree(nodeId);
        }
        return runningTotal / this.nodes.length / 2;
    }

    shortestPath(startId: string, endId: string) {
        const startNode = this.nodeDictionary[startId];
        const endNode = this.nodeDictionary[endId];
        if (!startNode || !endNode)
            throw "Path can only be calculated between two nodes in the network.";
        return this.breadthFirstSearch(
            this.edges,
            [{ node: startNode, depth: 0 }],
            endNode,
            []
        );
    }

    breadthFirstSearch(
        edges: { source: GraphNode; target: GraphNode }[],
        queue: { node: GraphNode; depth: number }[],
        endNode: GraphNode,
        covered: GraphNode[]
    ): number {
        if (queue.length > 0) {
            const current = queue.shift();
            const currNode = current?.node;
            const depth = current?.depth ?? 0;
            if (currNode === endNode) {
                return depth;
            } else {
                const nextOutNodes = edges
                    .filter((e) => e.source === currNode)
                    .map((e) => e.target);
                const nextInNodes = edges
                    .filter((e) => e.target === currNode)
                    .map((e) => e.source);
                const nextLevelNodes = nextOutNodes.concat(nextInNodes);

                for (let node of nextLevelNodes) {
                    if (!covered.includes(node)) {
                        queue.push({ node: node, depth: depth + 1 });
                        covered.push(node);
                    }
                }

                return this.breadthFirstSearch(edges, queue, endNode, covered);
            }
        } else {
            throw "Path not found.";
        }
    }


    // Runs BFS but returns the list of nodes covered in the process, which will map the largest connected component which includes the initially provided node.
    // The origin node should be passed (with depth 0) as an element in the queue parameter, and as an element in the covered parameter.
    connectedComponentMapBF(
                edges: { source: GraphNode; target: GraphNode }[],
                queue: { node: GraphNode; depth: number }[],
                covered: GraphNode[]
        ): GraphNode[] {
        if (queue.length > 0){
            const current = queue.shift();
            const currNode = current?.node;
            const depth = current?.depth ?? 0;

            const nextOutNodes = edges
                .filter((e) => e.source === currNode)
                .map((e) => e.target);
            const nextInNodes = edges
                .filter((e) => e.target === currNode)
                .map((e) => e.source);
            const nextLevelNodes = nextOutNodes.concat(nextInNodes);

            for (let node of nextLevelNodes) {
                if (!covered.includes(node)) {
                    queue.push({ node: node, depth: depth + 1 });
                    covered.push(node);
                }
            }

            return this.connectedComponentMapBF(edges, queue, covered);
        
        } else {
            // return a list of all the ids discovered in the search process (all those nodes in the largest connected component which includes the start node) 
            return covered;
        }
    }

    findLargestComponent(){
        const runningCoveredList: GraphNode[] = [];
        const components: GraphNode[][] = [];
        for (let node of this.nodes) {
            if (! runningCoveredList.includes(node)){
                const connectedComponent = this.connectedComponentMapBF(this.edges, [{node: node, depth: 0}], []);
                runningCoveredList.push(...connectedComponent);
                components.push(connectedComponent);
            }
        }
        let largestComponent: GraphNode[] = [];
        for (let component of components) {
            if (component.length > largestComponent.length) {
                largestComponent = component;
            }
        }
        return largestComponent;
    }




    generateRandomNetwork(n: number, p: number, nodePrefix = "n") {
        for (let i = 0; i < n; i++) {
            this.addNode({ id: `${nodePrefix}${i}` });
        }
        // once the nodes are added, add edges between them with probability p
        // nb. the edges in this graph are, in one sense, inherently directional, but for the purposes of this
        // function they are being treated as undirected; for directed graphs, or for undirected graphs where links
        // are represented by two complementary directed links, this function would need to be adapted.
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (Math.random() <= p) {
                    this.addEdge({
                        source: `${nodePrefix}${i}`,
                        target: `${nodePrefix}${j}`,
                    });
                }
            }
        }
    }

}

class GraphNode {
    id: string;
    x: number;
    y: number;
    label: string;
    displayLabel: boolean;
    weight: number;
    disp: { x: number; y: number };
    strokeColor: string;
    fillColor: string;

    constructor({
        id,
        x = 0,
        y = 0,
        strokeColor,
        fillColor,
        label = "",
        displayLabel = false,
        weight = 1,
        disp = { x: 0, y: 0 },
    }: {
        id: string;
        x: number;
        y: number;
        strokeColor: string;
        fillColor: string;
        label?: string;
        displayLabel?: boolean;
        weight?: number;
        disp?: { x: number; y: number };
    }) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.label = label;
        this.displayLabel = displayLabel;
        this.weight = weight;
        this.disp = disp;
        (this.strokeColor = strokeColor), (this.fillColor = fillColor);
    }
}
