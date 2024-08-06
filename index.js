function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
const createWalls = (mazeSize) => {
    let maze = [];
    for (let row = 0; row < mazeSize; row++) {
        maze.push(Array(mazeSize).fill("█"));
    }
    return maze;
}
const generatePoint = (mazeSize) => {
    const row = getRandomIntInclusive(1, mazeSize - 2);
    const col = getRandomIntInclusive(1, mazeSize - 2);
    return [row, col];
}
function randomDirection2(maze, x, y) {
    const directions = [
        [0, 2],  // right
        [2, 0],  // down
        [0, -2], // left
        [-2, 0]  // up
    ];

    const shuffledDirections = directions.sort(() => Math.random() - 0.5);

    for (const dir of shuffledDirections) {
        const [dx, dy] = dir;
        const nx = x + dx;
        const ny = y + dy;
        if (isValidMove(maze, nx, ny)) {
            return dir;
        }
    }

    return null; // No valid direction found
}
const isValidMove = (maze, x, y) => {
    return x > 0 && y > 0 && x < maze.length - 1 && y < maze[0].length - 1 && maze[x][y] === "█";
}
const carvePath = (mazeSize) => {
    const maze = createWalls(mazeSize);
    const stack = [];
    const start = generatePoint(mazeSize);
    let end = generatePoint(mazeSize);
    
    // Ensure start and end are not the same
    while (start[0] === end[0] && start[1] === end[1]) {
        end = generatePoint(mazeSize);
    }

    let current = start;

    maze[start[0]][start[1]] = 'S'; // Start point
    stack.push(start);

    while (stack.length > 0) {
        const [x, y] = current;
        const direction = randomDirection2(maze, x, y);

        if (direction) {
            const [dx, dy] = direction;
            const nx = x + dx;
            const ny = y + dy;
            const mx = x + dx / 2;
            const my = y + dy / 2;

            // Check bounds before modifying
            if (nx >= 0 && ny >= 0 && nx < maze.length && ny < maze[0].length) {
                maze[nx][ny] = '░';
            }

            if (mx >= 0 && my >= 0 && mx < maze.length && my < maze[0].length) {
                maze[mx][my] = '░';
            }

            current = [nx, ny];
            stack.push(current);
        } else {
            current = stack.pop();
            if (stack.length > 0) {
                current = stack[stack.length - 1];
            }
        }
    }
    maze[end[0]][end[1]] = 'E';
    return {start,end,grid:maze};
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const printMaze = async (maze) => {
    console.clear(); // Clear the console
    process.stdout.write('\x1b[H'); // Move cursor to the top-left corner
    let mazeView = maze.map(row => row.join('')).join('\n');
    process.stdout.write(mazeView); // Print the maze
    await delay(50); // Adjust delay as needed
};
function generateMaze(mazeSize,shouldPrint){
    if(!mazeSize) return
    if(mazeSize%2==0){
        mazeSize+=1;
    }
    const maze = carvePath(mazeSize>11?mazeSize:11);
    shouldPrint && printMaze(maze.grid);
    return maze;
}



class Node{
    constructor(data){
        this.x=data[0];
        this.y=data[1]
    }
}
class Frontier{
    constructor(node){
        this.nodeList=[node]
    }
    remove(){
        throw new Error("Method 'add' must be implemented.");
    }
    add(){
        throw new Error("Method 'remove' must be implemented.");
    }
}
class StackFrontier extends Frontier {
    constructor(node){
        super(node)
    }
    add(node) {
        this.nodeList.push(node);
    }
    remove() {
        if (this.nodeList.length === 0) {
            throw new Error("Frontier is empty.");
        }
        return this.nodeList.pop();
    }
}
class StackFrontierInformed extends Frontier {
    constructor(node,dist){
        super(node)
        this.dist=dist;
    }
    add(node) {
        this.nodeList.push(node);
    }
    remove() {
        if (this.nodeList.length === 0) {
            throw new Error("Frontier is empty.");
        }
        let smallest;
        let nodeIndex;
        this.nodeList.forEach((node,index)=>{
            if(smallest && this.dist[smallest.x][smallest.y]>this.dist[node.x][node.y]){
                smallest=node;
                nodeIndex=index;
            }else{
                smallest=node;
                nodeIndex=index;
            }
        })
        if (nodeIndex > -1) {
            this.nodeList.splice(nodeIndex, 1);
        }
        return smallest;
        // return this.nodeList.pop();
    }
}
class QueueFrontier extends Frontier {
    constructor(node){
        super(node)
    }
    add(node) {
        this.nodeList.push(node);
    }
    remove() {
        if (this.nodeList.length === 0) {
            throw new Error("Frontier is empty.");
        }
        return this.nodeList.shift();
    }
}
const DFS = async (maze) => {
    // let maze = generateMaze(31, false);
    const frontier=new StackFrontier(new Node(maze.start))
    const goal = new Node(maze.end);
    const grid = maze.grid.map(row => [...row]); // Create a deep copy of the grid
    
    while (frontier.nodeList.length !== 0) {
        const node = frontier.remove();
        if (grid[node.x][node.y] !== "S" && grid[node.x][node.y] !== "E") {
            grid[node.x][node.y] = ".";
        }
        await printMaze(grid);
        if (node.x === goal.x && node.y === goal.y) {
            return true;
        } else {
            if (node.x - 1 > 0 && grid[node.x - 1][node.y] !== "█" && grid[node.x - 1][node.y] !== ".") {
                frontier.add(new Node([node.x - 1, node.y]));
            }
            if (node.x + 1 < grid.length - 1 && grid[node.x + 1][node.y] !== "█" && grid[node.x + 1][node.y] !== ".") {
                frontier.add(new Node([node.x + 1, node.y]));
            }
            if (node.y - 1 > 0 && grid[node.x][node.y - 1] !== "█" && grid[node.x][node.y - 1] !== ".") {
                frontier.add(new Node([node.x, node.y - 1]));
            }
            if (node.y + 1 < grid[0].length - 1 && grid[node.x][node.y + 1] !== "█" && grid[node.x][node.y + 1] !== ".") {
                frontier.add(new Node([node.x, node.y + 1]));
            }
        }
    }
};

const BFS = async (maze) => {
    // let maze = generateMaze(31, false);
    const frontier=new QueueFrontier(new Node(maze.start))
    const goal = new Node(maze.end);
    const grid = maze.grid.map(row => [...row]); // Create a deep copy of the grid
    
    while (frontier.nodeList.length !== 0) {
        const node = frontier.remove();
        if (grid[node.x][node.y] !== "S" && grid[node.x][node.y] !== "E") {
            grid[node.x][node.y] = ".";
        }
        await printMaze(grid);
        if (node.x === goal.x && node.y === goal.y) {
            return true;
        } else {
            if (node.x - 1 > 0 && grid[node.x - 1][node.y] !== "█" && grid[node.x - 1][node.y] !== ".") {
                frontier.add(new Node([node.x - 1, node.y]));
            }
            if (node.x + 1 < grid.length - 1 && grid[node.x + 1][node.y] !== "█" && grid[node.x + 1][node.y] !== ".") {
                frontier.add(new Node([node.x + 1, node.y]));
            }
            if (node.y - 1 > 0 && grid[node.x][node.y - 1] !== "█" && grid[node.x][node.y - 1] !== ".") {
                frontier.add(new Node([node.x, node.y - 1]));
            }
            if (node.y + 1 < grid[0].length - 1 && grid[node.x][node.y + 1] !== "█" && grid[node.x][node.y + 1] !== ".") {
                frontier.add(new Node([node.x, node.y + 1]));
            }
        }
    }
};

const maze=generateMaze(21, false)
function manhattanDistance(maze){
    let dist=[];
    for(i=0;i<maze.grid.length;i++){
        const temp=[];
        for(let j=0;j<maze.grid[0].length;j++){
            temp[j]=Math.abs(i - maze.end[0]) + Math.abs(j - maze.end[1]);
        }
        dist.push(temp);
    }
    return dist;
}
// BFS(maze)

// DFS(maze)

const GBFS = async (maze) => {
    const dist=manhattanDistance(maze)
    const frontier=new StackFrontierInformed(new Node(maze.start),dist)
    const goal = new Node(maze.end);
    const grid = maze.grid.map(row => [...row]); // Create a deep copy of the grid
    
    while (frontier.nodeList.length !== 0) {
        const node = frontier.remove();
        if (grid[node.x][node.y] !== "S" && grid[node.x][node.y] !== "E") {
            grid[node.x][node.y] = ".";
        }
        await printMaze(grid);
        if (node.x === goal.x && node.y === goal.y) {
            return true;
        } else {
            if (node.x - 1 > 0 && grid[node.x - 1][node.y] !== "█" && grid[node.x - 1][node.y] !== ".") {
                frontier.add(new Node([node.x - 1, node.y]));
            }
            if (node.x + 1 < grid.length - 1 && grid[node.x + 1][node.y] !== "█" && grid[node.x + 1][node.y] !== ".") {
                frontier.add(new Node([node.x + 1, node.y]));
            }
            if (node.y - 1 > 0 && grid[node.x][node.y - 1] !== "█" && grid[node.x][node.y - 1] !== ".") {
                frontier.add(new Node([node.x, node.y - 1]));
            }
            if (node.y + 1 < grid[0].length - 1 && grid[node.x][node.y + 1] !== "█" && grid[node.x][node.y + 1] !== ".") {
                frontier.add(new Node([node.x, node.y + 1]));
            }
        }
    }
};
GBFS(maze);

