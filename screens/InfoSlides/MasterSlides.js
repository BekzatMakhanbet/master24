import React from 'react';
import { Dimensions, Image, Modal, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-elements';
import SideSwipe from 'react-native-sideswipe';
import getFontSize from '../../utils/getFontSize';

const { width, height } = Dimensions.get('window');

class MasterSlides extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      images: [
        { src: require('../../assets/images/6gif.gif') },
        { src: require('../../assets/images/7gif.gif') },
        { src: require('../../assets/images/8gif.gif') },
        // { src: require('../../assets/images/9gif.gif') },
        { src: require('../../assets/images/10gif.gif') },
      ],
    };
  }

  navigateToCreate = () => {
    this.props.closeModalFirstMaster();
  };

  render() {
    return (
      <Modal visible={this.props.firstMasterModal} transparent={false} animationType="padding">
        <View style={styles.container}>
          <SideSwipe
            data={this.state.images}
            style={styles.carousel}
            itemWidth={width}
            threshold={120}
            onIndexChange={(index) => this.setState({ index })}
            contentOffset={0}
            renderItem={(hz) => {
              return (
                <View
                  style={{
                    width,
                    paddingHorizontal: 10,
                    paddingTop: 30,
                    alignItems: 'center',
                  }}
                >
                  <Image
                    source={this.state.images[hz.itemIndex].src}
                    style={{
                      width: 250,
                      height: getFontSize(344),
                    }}
                  />
                </View>
              );
            }}
          />
          <View style={{ flexDirection: 'row' }}>
            {this.state.images.map((image, index) => {
              return (
                <View
                  key={`${index}`}
                  style={[
                    {
                      backgroundColor: index === this.state.index ? '#999999' : '#e9f0f4',
                    },
                    { borderRadius: 25, width: 15, height: 15, margin: 5 },
                  ]}
                />
              );
            })}
          </View>
          <Button
            onPress={this.navigateToCreate}
            title="??????????"
            titleStyle={{ textAlign: 'center' }}
            buttonStyle={{
              backgroundColor: '#0288c7',
              marginVertical: 20,
            }}
            containerStyle={{ width: '80%', alignSelf: 'center' }}
          />
          {/* <Image
            style={{ width: 80, height: 70, marginBottom: 5 }}
            source={require('../../assets/images/logo.png')}
          /> */}
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    width: '100%',
    height,
  },
});

export default MasterSlides;
