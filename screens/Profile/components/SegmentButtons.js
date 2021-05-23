import React from 'react';
import { Segment, Button } from 'native-base';
import { Text } from 'react-native';
import styles from '../styles';

export const SegmentButtons = ({ activePage, setStateValues, t, color, reviewsLength }) => {
  return (
    <Segment style={styles.segment}>
      <Button
        large
        style={[
          activePage === 1
            ? {
                backgroundColor: color,
              }
            : styles.buttonInactive,
          styles.segmentButton,
        ]}
        active={activePage === 1}
        onPress={() => setStateValues('activePage', 1)}
      >
        <Text
          allowFontScaling={false}
          style={activePage === 1 ? styles.segmentTextActive : styles.segmentTextInactive}
        >
          Анкета
        </Text>
      </Button>
      <Button
        large
        style={[
          activePage === 2
            ? {
                backgroundColor: color,
              }
            : styles.buttonInactive,
          styles.segmentButton,
        ]}
        active={activePage === 2}
        onPress={() => setStateValues('activePage', 2)}
      >
        <Text
          allowFontScaling={false}
          style={activePage === 2 ? styles.segmentTextActive : styles.segmentTextInactive}
        >
          {t('profile:reviews')} ({reviewsLength})
        </Text>
      </Button>
    </Segment>
  );
};
