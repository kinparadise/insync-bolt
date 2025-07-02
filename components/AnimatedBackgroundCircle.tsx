import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Dimensions, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedBackgroundCircleProps {
  style?: StyleProp<ViewStyle>;
  height?: number;
}

export function AnimatedBackgroundCircle({ style, height }: AnimatedBackgroundCircleProps) {
  const { width: screenWidth, height: deviceHeight } = Dimensions.get('window');
  const { theme } = useTheme();
  const screenHeight = height ?? deviceHeight;
  const circleRadius = 120;
  const minX = circleRadius;
  const maxX = screenWidth - circleRadius;
  const minY = circleRadius;
  const maxY = screenHeight - circleRadius;
  const circleAnim = useRef(new Animated.ValueXY({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 })).current;

  useEffect(() => {
    let isMounted = true;
    let timeout: ReturnType<typeof setTimeout>;

    const animateToRandom = () => {
      if (!isMounted) return;
      const newX = minX + Math.random() * (maxX - minX);
      const newY = minY + Math.random() * (maxY - minY);
      Animated.timing(circleAnim, {
        toValue: { x: newX, y: newY },
        duration: 3500,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.quad),
      }).start(() => {
        timeout = setTimeout(animateToRandom, 1200 + Math.random() * 1200);
      });
    };
    animateToRandom();
    return () => {
      isMounted = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [circleAnim, minX, maxX, minY, maxY]);

  return (
    <Animated.View style={[{ position: 'absolute', top: 0, left: 0, width: screenWidth, height: screenHeight, zIndex: 0 }, style]} pointerEvents="none">
      <Svg height={screenHeight} width={screenWidth} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Defs>
          <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={theme.colors.secondary} stopOpacity="0.10" />
          </SvgLinearGradient>
        </Defs>
        <AnimatedCircle
          cx={circleAnim.x}
          cy={circleAnim.y}
          r={circleRadius}
          fill="url(#grad)"
        />
      </Svg>
    </Animated.View>
  );
} 