import { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  MiniMap,
  BackgroundVariant,
} from "@xyflow/react";
import type { Node, Edge, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Plus,
  Layout,
  Eye,
  AlertCircle,
  CheckCircle,
  Trash2,
  MousePointer,
  Undo2,
  Redo2,
  Palette,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomNode from "./CustomNode";
import { validateDAG } from "@/utils/dagValidation";
import type { ValidationResult } from "@/utils/dagValidation";
import { autoLayout } from "@/utils/autoLayout";
import JSONPreview from "./JSONPreview";
import PresetTemplates from "./PresetTemplates";
import EdgeEditor from "./EdgeEditor";

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];


const nodeThemes = {
  default: { bg: "bg-white", border: "border-gray-200", text: "text-gray-900" },
  blue: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-900" },
  green: {
    bg: "bg-green-50",
    border: "border-green-300",
    text: "text-green-900",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-300",
    text: "text-purple-900",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-900",
  },
};

const DAGBuilderFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    errors: [],
  });
  const [showJSONPreview, setShowJSONPreview] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [nodeCounter, setNodeCounter] = useState(1);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showEdgeEditor, setShowEdgeEditor] = useState(false);
  const [selectedTheme, setSelectedTheme] =
    useState<keyof typeof nodeThemes>("default");
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>(
    []
  );
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { fitView } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Save to history
  const saveToHistory = useCallback(() => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ nodes: [...nodes], edges: [...edges] });
      return newHistory.slice(-20); // Keep only last 20 states
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 19));
  }, [nodes, edges, historyIndex]);

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex((prev) => prev - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const addNode = useCallback(() => {
    const name = prompt("Enter node name:");
    if (!name) return;

    saveToHistory();
    const id = `node-${nodeCounter}`;
    const theme = nodeThemes[selectedTheme];
    const newNode: Node = {
      id,
      type: "custom",
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        label: name,
        theme: selectedTheme,
        className: `${theme.bg} ${theme.border} ${theme.text}`,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeCounter((prev) => prev + 1);
  }, [nodeCounter, selectedTheme, saveToHistory, setNodes]);

  const handleAutoLayout = useCallback(() => {
    saveToHistory();
    const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayout(
      nodes,
      edges
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);

    setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 0);
  }, [nodes, edges, saveToHistory, setNodes, setEdges, fitView]);

  // Validate DAG whenever nodes or edges change
  useEffect(() => {
    const result = validateDAG(nodes, edges);
    setValidation(result);
  }, [nodes, edges]);

  // Handle edge selection
  useEffect(() => {
    const selected = edges.find((edge) => edge.selected);
    setSelectedEdge(selected || null);
  }, [edges]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        saveToHistory();
        setNodes((nodes) => nodes.filter((node) => !node.selected));
        setEdges((edges) => edges.filter((edge) => !edge.selected));
        setSelectedEdge(null);
      }

      if (event.ctrlKey && event.key === "a") {
        event.preventDefault();
        setNodes((nodes) => nodes.map((node) => ({ ...node, selected: true })));
        setEdges((edges) => edges.map((edge) => ({ ...edge, selected: true })));
      }

      if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }

      if (
        event.ctrlKey &&
        (event.key === "y" || (event.key === "z" && event.shiftKey))
      ) {
        event.preventDefault();
        redo();
      }

      if (event.key === "n" && event.ctrlKey) {
        event.preventDefault();
        addNode();
      }

      if (event.key === "l" && event.ctrlKey) {
        event.preventDefault();
        handleAutoLayout();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    setNodes,
    setEdges,
    undo,
    redo,
    addNode,
    handleAutoLayout,
    saveToHistory,
  ]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      if (params.source === params.target) {
        console.warn("Self-loops are not allowed");
        return;
      }

      const existingEdge = edges.find(
        (edge) => edge.source === params.source && edge.target === params.target
      );
      if (existingEdge) {
        console.warn("Connection already exists");
        return;
      }

      saveToHistory();
      const newEdge: Edge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        label: "Edge",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: { strokeWidth: 2 },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [edges, setEdges, saveToHistory]
  );

  const deleteSelectedEdge = () => {
    if (selectedEdge) {
      setEdges((edges) => edges.filter((edge) => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  };

  const selectAll = () => {
    setNodes((nodes) => nodes.map((node) => ({ ...node, selected: true })));
    setEdges((edges) => edges.map((edge) => ({ ...edge, selected: true })));
  };

  const deleteAll = () => {
    if (window.confirm("Are you sure you want to delete the entire diagram?")) {
      setNodes([]);
      setEdges([]);
      setNodeCounter(1);
      setSelectedEdge(null);
    }
  };

  const editSelectedEdge = () => {
    if (selectedEdge) {
      setShowEdgeEditor(true);
    }
  };

  const updateEdgeLabel = (edgeId: string, newLabel: string) => {
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === edgeId ? { ...edge, label: newLabel } : edge
      )
    );
  };

  const loadPreset = (presetNodes: Node[], presetEdges: Edge[]) => {
    setNodes(presetNodes);
    setEdges(presetEdges);
    setNodeCounter(presetNodes.length + 1);
    setShowPresets(false);

    setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 0);
  };

  const changeNodeTheme = (theme: keyof typeof nodeThemes) => {
    setSelectedTheme(theme);
    const themeData = nodeThemes[theme];
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          theme,
          className: `${themeData.bg} ${themeData.border} ${themeData.text}`,
        },
      }))
    );
  };

  const getValidationIcon = () => {
    return validation.isValid ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-500" />
    );
  };

  const hasSelectedItems =
    nodes.some((n) => n.selected) || edges.some((e) => e.selected);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              DAG Builder Pro
            </h1>
            <p className="text-sm text-gray-600">
              Advanced directed acyclic graph editor
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={addNode}
              className="w-full justify-start text-white bg-gray-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Node (Ctrl+N)
            </Button>
            <Button
              onClick={handleAutoLayout}
              variant="outline"
              className="w-full justify-start"
              size="sm"
            >
              <Layout className="w-4 h-4 mr-2" />
              Auto Layout (Ctrl+L)
            </Button>
            <Button
              onClick={() => setShowPresets(true)}
              variant="outline"
              className="w-full justify-start"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Load Preset
            </Button>
            <Button
              onClick={() => setShowJSONPreview(!showJSONPreview)}
              variant="outline"
              className="w-full justify-start"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showJSONPreview ? "Hide" : "Show"} JSON
            </Button>
          </div>

          {/* History Controls */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">History</h3>
            <div className="flex gap-2">
              <Button
                onClick={undo}
                disabled={!canUndo}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Undo2 className="w-4 h-4 mr-1" />
                Undo
              </Button>
              <Button
                onClick={redo}
                disabled={!canRedo}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Redo2 className="w-4 h-4 mr-1" />
                Redo
              </Button>
            </div>
          </Card>

          {/* Theme Selector */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              Node Theme
            </h3>
            <Select
              value={selectedTheme}
              onValueChange={(value: keyof typeof nodeThemes) =>
                changeNodeTheme(value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Selection Controls */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-1">Selection Controls</h3>
            <div className="space-y-2">
              <Button
                onClick={selectAll}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <MousePointer className="w-4 h-4 mr-2" />
                Select All (Ctrl+A)
              </Button>
              {hasSelectedItems && (
                <Button
                  onClick={() => {
                    setNodes((nodes) => nodes.filter((node) => !node.selected));
                    setEdges((edges) => edges.filter((edge) => !edge.selected));
                  }}
                  variant="destructive"
                  className="w-full justify-start text-red-600"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              )}
              <Button
                onClick={deleteAll}
                variant="destructive"
                className="w-full justify-start bg-red-600"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </Card>

          {/* Edge Controls */}
          {selectedEdge && (
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-1">Selected Edge</h3>
              <div className="space-y-2">
                <p className="text-xs text-gray-600">
                  {selectedEdge.source} → {selectedEdge.target}
                </p>
                <p className="text-xs font-medium">
                  Label: {selectedEdge.label || "Untitled"}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={editSelectedEdge}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={deleteSelectedEdge}
                    variant="destructive"
                    className="flex-1"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Validation Status */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              {getValidationIcon()}
              <h3 className="font-semibold text-sm">
                {validation.isValid ? "Valid DAG" : "Invalid DAG"}
              </h3>
            </div>

            {validation.errors.length > 0 && (
              <div className="space-y-2">
                {validation.errors.map((error, index) => (
                  <Badge key={index} variant="destructive" className="text-xs text-red-600">
                    {error}
                  </Badge>
                ))}
              </div>
            )}

            {validation.isValid && (
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 text-xs"
              >
                All validation rules passed
              </Badge>
            )}
          </Card>

          {/* Stats */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-1">Graph Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nodes:</span>
                <span className="font-medium">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Edges:</span>
                <span className="font-medium">{edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Selected:</span>
                <span className="font-medium">
                  {nodes.filter((n) => n.selected).length +
                    edges.filter((e) => e.selected).length}
                </span>
              </div>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-1">Instructions</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p>• Click "Add Node" to create new nodes</p>
              <p>• Drag from right handle to left handle to connect</p>
              <p>• Click edges to select and edit them</p>
              <p>• Press Delete to remove selected items</p>
              <p>• Use Ctrl+A to select all items</p>
              <p>• Use "Load Preset" for common structures</p>
            </div>
          </Card>

          {/* Enhanced Instructions */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-1">Keyboard Shortcuts</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                • <strong>Ctrl+N:</strong> Add new node
              </p>
              <p>
                • <strong>Ctrl+L:</strong> Auto layout
              </p>
              <p>
                • <strong>Ctrl+A:</strong> Select all
              </p>
              <p>
                • <strong>Delete:</strong> Remove selected
              </p>
              <p>
                • <strong>Ctrl+Z:</strong> Undo
              </p>
              <p>
                • <strong>Ctrl+Y:</strong> Redo
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative flex flex-col">
        <div
          ref={reactFlowWrapper}
          className={`flex-1 ${showPreviewPanel ? "h-2/3" : "h-full"}`}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
            defaultEdgeOptions={{
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
              },
              style: { strokeWidth: 2 },
            }}
          >
            <Controls className="bg-white border border-gray-200" />
            <Background
              color="#94a3b8"
              gap={16}
              size={2}
              variant={BackgroundVariant.Dots}
            />
            <MiniMap
              className="bg-white border border-gray-200"
              nodeColor={(node) => {
                const theme = (node as any).data?.theme || "default";
                const themeColors: { [key: string]: string } = {
                  blue: "#3b82f6",
                  green: "#10b981",
                  purple: "#8b5cf6",
                  orange: "#f59e0b",
                  default: "#6b7280",
                };
                return themeColors[theme] || themeColors.default;
              }}
              maskColor="rgba(0,0,0,0.1)"
            />
          </ReactFlow>
        </div>

        {/* Preview Panel */}
        {showPreviewPanel && (
          <div className="h-1/3 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <h3 className="font-semibold text-sm">Live Preview</h3>
              </div>
              <Button
                onClick={() => setShowPreviewPanel(false)}
                variant="ghost"
                size="sm"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 h-full overflow-auto">
              <JSONPreview
                nodes={nodes}
                edges={edges}
                onClose={() => {}}
                embedded={true}
              />
            </div>
          </div>
        )}

        {/* Toggle Preview Button */}
        {!showPreviewPanel && (
          <Button
            onClick={() => setShowPreviewPanel(true)}
            className="absolute bottom-4 right-4 shadow-lg"
            size="sm"
          >
            <ChevronUp className="w-4 h-4 mr-2" />
            Show Preview
          </Button>
        )}

        {/* JSON Preview Overlay */}
        {showJSONPreview && (
          <JSONPreview
            nodes={nodes}
            edges={edges}
            onClose={() => setShowJSONPreview(false)}
          />
        )}

        {/* Preset Templates Overlay */}
        {showPresets && (
          <PresetTemplates
            onClose={() => setShowPresets(false)}
            onLoadPreset={loadPreset}
          />
        )}

        {/* Edge Editor Modal */}
        {showEdgeEditor && selectedEdge && (
          <EdgeEditor
            edge={selectedEdge}
            onClose={() => setShowEdgeEditor(false)}
            onUpdateLabel={updateEdgeLabel}
          />
        )}
      </div>
    </div>
  );
};

const DAGBuilder = () => {
  return (
    <ReactFlowProvider>
      <DAGBuilderFlow />
    </ReactFlowProvider>
  );
};

export default DAGBuilder;
