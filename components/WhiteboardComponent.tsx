import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, PanResponder, Dimensions } from 'react-native';
import { Svg, Path, Circle, Rect, Text as SvgText } from 'react-native-svg';
import { CreditCard as Edit3, Square, Circle as CircleIcon, Type, Eraser, Download, Share, Undo, Redo, Palette, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WhiteboardProps {
  visible: boolean;
  onClose: () => void;
}

interface DrawingPath {
  id: string;
  path: string;
  color: string;
  strokeWidth: number;
  tool: 'pen' | 'eraser';
}

interface Shape {
  id: string;
  type: 'circle' | 'rectangle' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
}

export function WhiteboardComponent({ visible, onClose }: WhiteboardProps) {
  const { theme } = useTheme();
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'circle' | 'rectangle' | 'text'>('pen');
  const [currentColor, setCurrentColor] = useState('#4FC3F7');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [undoStack, setUndoStack] = useState<{ paths: DrawingPath[], shapes: Shape[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ paths: DrawingPath[], shapes: Shape[] }[]>([]);

  const pathRef = useRef('');
  const startPointRef = useRef({ x: 0, y: 0 });

  const colors = [
    '#4FC3F7', '#F44336', '#4CAF50', '#FF9800', 
    '#9C27B0', '#2196F3', '#FFEB3B', '#795548',
    '#607D8B', '#E91E63', '#00BCD4', '#8BC34A'
  ];

  const saveState = () => {
    setUndoStack(prev => [...prev, { paths: [...paths], shapes: [...shapes] }]);
    setRedoStack([]);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      
      if (currentTool === 'pen' || currentTool === 'eraser') {
        saveState();
        setIsDrawing(true);
        pathRef.current = `M${locationX},${locationY}`;
        setCurrentPath(pathRef.current);
      } else if (currentTool === 'circle' || currentTool === 'rectangle') {
        saveState();
        startPointRef.current = { x: locationX, y: locationY };
      } else if (currentTool === 'text') {
        saveState();
        const newShape: Shape = {
          id: Date.now().toString(),
          type: 'text',
          x: locationX,
          y: locationY,
          text: 'Text',
          color: currentColor,
        };
        setShapes(prev => [...prev, newShape]);
      }
    },

    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      
      if (currentTool === 'pen' || currentTool === 'eraser') {
        if (isDrawing) {
          pathRef.current += ` L${locationX},${locationY}`;
          setCurrentPath(pathRef.current);
        }
      }
    },

    onPanResponderRelease: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      
      if (currentTool === 'pen' || currentTool === 'eraser') {
        if (isDrawing) {
          const newPath: DrawingPath = {
            id: Date.now().toString(),
            path: pathRef.current,
            color: currentTool === 'eraser' ? 'transparent' : currentColor,
            strokeWidth: currentTool === 'eraser' ? strokeWidth * 2 : strokeWidth,
            tool: currentTool,
          };
          setPaths(prev => [...prev, newPath]);
          setCurrentPath('');
          setIsDrawing(false);
        }
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(locationX - startPointRef.current.x, 2) + 
          Math.pow(locationY - startPointRef.current.y, 2)
        );
        const newShape: Shape = {
          id: Date.now().toString(),
          type: 'circle',
          x: startPointRef.current.x,
          y: startPointRef.current.y,
          radius,
          color: currentColor,
        };
        setShapes(prev => [...prev, newShape]);
      } else if (currentTool === 'rectangle') {
        const width = Math.abs(locationX - startPointRef.current.x);
        const height = Math.abs(locationY - startPointRef.current.y);
        const newShape: Shape = {
          id: Date.now().toString(),
          type: 'rectangle',
          x: Math.min(startPointRef.current.x, locationX),
          y: Math.min(startPointRef.current.y, locationY),
          width,
          height,
          color: currentColor,
        };
        setShapes(prev => [...prev, newShape]);
      }
    },
  });

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, { paths: [...paths], shapes: [...shapes] }]);
      setPaths(lastState.paths);
      setShapes(lastState.shapes);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, { paths: [...paths], shapes: [...shapes] }]);
      setPaths(nextState.paths);
      setShapes(nextState.shapes);
      setRedoStack(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    saveState();
    setPaths([]);
    setShapes([]);
  };

  const handleSave = () => {
    // In a real app, this would save the whiteboard content
    console.log('Saving whiteboard...');
  };

  const handleShare = () => {
    // In a real app, this would share the whiteboard
    console.log('Sharing whiteboard...');
  };

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Whiteboard</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Download size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Share size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <View style={styles.toolGroup}>
            <TouchableOpacity
              style={[styles.toolButton, currentTool === 'pen' && styles.toolButtonActive]}
              onPress={() => setCurrentTool('pen')}
            >
              <Edit3 size={20} color={currentTool === 'pen' ? '#ffffff' : theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toolButton, currentTool === 'eraser' && styles.toolButtonActive]}
              onPress={() => setCurrentTool('eraser')}
            >
              <Eraser size={20} color={currentTool === 'eraser' ? '#ffffff' : theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toolButton, currentTool === 'circle' && styles.toolButtonActive]}
              onPress={() => setCurrentTool('circle')}
            >
              <CircleIcon size={20} color={currentTool === 'circle' ? '#ffffff' : theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toolButton, currentTool === 'rectangle' && styles.toolButtonActive]}
              onPress={() => setCurrentTool('rectangle')}
            >
              <Square size={20} color={currentTool === 'rectangle' ? '#ffffff' : theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toolButton, currentTool === 'text' && styles.toolButtonActive]}
              onPress={() => setCurrentTool('text')}
            >
              <Type size={20} color={currentTool === 'text' ? '#ffffff' : theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.toolGroup}>
            <TouchableOpacity
              style={styles.colorButton}
              onPress={() => setShowColorPicker(true)}
            >
              <View style={[styles.colorPreview, { backgroundColor: currentColor }]} />
              <Palette size={16} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toolButton, undoStack.length === 0 && styles.toolButtonDisabled]}
              onPress={handleUndo}
              disabled={undoStack.length === 0}
            >
              <Undo size={20} color={undoStack.length === 0 ? theme.colors.textTertiary : theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toolButton, redoStack.length === 0 && styles.toolButtonDisabled]}
              onPress={handleRedo}
              disabled={redoStack.length === 0}
            >
              <Redo size={20} color={redoStack.length === 0 ? theme.colors.textTertiary : theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Canvas */}
        <View style={styles.canvas} {...panResponder.panHandlers}>
          <Svg width={screenWidth} height={screenHeight - 160} style={styles.svg}>
            {/* Render completed paths */}
            {paths.map((pathData) => (
              <Path
                key={pathData.id}
                d={pathData.path}
                stroke={pathData.tool === 'eraser' ? theme.colors.background : pathData.color}
                strokeWidth={pathData.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            
            {/* Render current path being drawn */}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={currentTool === 'eraser' ? theme.colors.background : currentColor}
                strokeWidth={currentTool === 'eraser' ? strokeWidth * 2 : strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {/* Render shapes */}
            {shapes.map((shape) => {
              if (shape.type === 'circle') {
                return (
                  <Circle
                    key={shape.id}
                    cx={shape.x}
                    cy={shape.y}
                    r={shape.radius}
                    stroke={shape.color}
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                );
              } else if (shape.type === 'rectangle') {
                return (
                  <Rect
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    stroke={shape.color}
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                );
              } else if (shape.type === 'text') {
                return (
                  <SvgText
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    fontSize="16"
                    fill={shape.color}
                    fontFamily="Inter-Regular"
                  >
                    {shape.text}
                  </SvgText>
                );
              }
              return null;
            })}
          </Svg>
        </View>

        {/* Color Picker Modal */}
        <Modal
          visible={showColorPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowColorPicker(false)}
        >
          <TouchableOpacity 
            style={styles.colorPickerOverlay}
            onPress={() => setShowColorPicker(false)}
            activeOpacity={1}
          >
            <View style={styles.colorPickerContent}>
              <Text style={styles.colorPickerTitle}>Choose Color</Text>
              <View style={styles.colorGrid}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      currentColor === color && styles.colorOptionSelected
                    ]}
                    onPress={() => {
                      setCurrentColor(color);
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  toolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolButton: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toolButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  toolButtonDisabled: {
    opacity: 0.5,
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  clearButton: {
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  svg: {
    flex: 1,
  },
  colorPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  colorPickerContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  colorPickerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: theme.colors.text,
  },
});