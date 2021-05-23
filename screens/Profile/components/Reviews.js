import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Comment from '../../../components/Comment/Comment';

export const Reviews = ({ reviews, collapseReviews, setStateValues, t }) => {
  return (
    <View style={styles.parentView}>
      <View style={styles.childView}>
        <Text allowFontScaling={false} style={styles.labelInfo}>
          {t('profile:reviews')} ({reviews ? reviews.length : 0})
        </Text>
      </View>
      <FlatList
        data={collapseReviews ? reviews : reviews ? reviews.slice(0, 8) : []}
        style={styles.flatList}
        renderItem={({ item, index }) => {
          return (
            <Comment
              key={index}
              text={item.text}
              person={item.user}
              grade={item.rating}
              data={item.created}
            />
          );
        }}
        keyExtractor={(item) => item.id + ''}
        ListEmptyComponent={
          <Text allowFontScaling={false} style={styles.noReviewsText}>
            {t('simple:noReviews')}
          </Text>
        }
      />
      {reviews && reviews.length > 8 && (
        <TouchableOpacity
          onPress={() => setStateValues('collapseReviews', !collapseReviews)}
          style={styles.touchableOpacity}
        >
          <Text allowFontScaling={false} style={styles.showMoreButton}>
            {collapseReviews ? t('simple:close') : `+ ${t('simple:showMore')}`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  showMoreButton: {
    color: '#c20021',
    fontWeight: '500',
    fontSize: 17,
    marginVertical: 10,
    textAlign: 'center',
  },
  touchableOpacity: { alignSelf: 'center', marginBottom: 10 },
  noReviewsText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 20,
    color: '#999999',
  },
  parentView: { width: '100%', alignItems: 'center' },
  childView: { width: '90%' },
  flatList: { width: '100%' },
  labelInfo: {
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 7,
  },
});
