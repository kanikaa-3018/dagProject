import type { Node, Edge } from '@xyflow/react';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateDAG = (nodes: Node[], edges: Edge[]): ValidationResult => {
  const errors: string[] = [];

  // Rule 1: At least 2 nodes
  if (nodes.length < 2) {
    errors.push('DAG must have at least 2 nodes');
  }

  // Rule 2: No cycles (using DFS)
  if (hasCycles(nodes, edges)) {
    errors.push('DAG cannot contain cycles');
  }

  // Rule 3: All nodes connected by at least one edge (if more than 1 node)
  if (nodes.length > 1) {
    const connectedNodes = new Set<string>();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
    
    const unconnectedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    if (unconnectedNodes.length > 0) {
      errors.push(`${unconnectedNodes.length} node(s) are not connected`);
    }
  }

  // Rule 4: No self-loops (already handled in connection logic, but double-check)
  const selfLoops = edges.filter(edge => edge.source === edge.target);
  if (selfLoops.length > 0) {
    errors.push('Self-loops are not allowed');
  }

  return {
    isValid: errors.length === 0 && nodes.length >= 2,
    errors,
  };
};

const hasCycles = (nodes: Node[], edges: Edge[]): boolean => {
  const graph = new Map<string, string[]>();
  const visited = new Set<string>();
  const recStack = new Set<string>();

  // Build adjacency list
  nodes.forEach(node => graph.set(node.id, []));
  edges.forEach(edge => {
    const neighbors = graph.get(edge.source) || [];
    neighbors.push(edge.target);
    graph.set(edge.source, neighbors);
  });

  // DFS to detect cycles
  const dfs = (nodeId: string): boolean => {
    visited.add(nodeId);
    recStack.add(nodeId);

    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true; // Back edge found, cycle detected
      }
    }

    recStack.delete(nodeId);
    return false;
  };

  // Check all nodes
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
};