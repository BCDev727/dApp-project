import React, { Fragment, Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, PixelRatio, Image, Linking, Dimensions, TextInput, ScrollView, FlatList } from 'react-native';
import { Icon, Container, Header, Left, Button, Body, Title, Right } from 'native-base';
import { AppLoading, Constants, ImagePicker, Permissions } from 'expo';

import Spinner from './components/Spinner';
import Card from './components/Card';
import TextContainer from './components/TextContainer';

const options = {
  title: 'Select Avatar',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

const { height, width } = Dimensions.get('window');
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatarSource: null,
      loading: null,
      fetchLoading: true,
      clickUpload: false,
      uploadStatus: false,
      isReady: false,
      label: ''
    };
  }
  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
    });
    await this.loadImages();

    this.setState({
      isReady: true,
    });
  };

  loadImages = async () => {
    const config = {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
    };
    fetch('http://10.0.2.2:5000/images', config)
      .then((resp) => resp.json())
      .then((res) => {
        this.setState({
          images: res,
          fetchLoading: false
        })
      })
      .catch((err) => {
        this.setState({
          fetchLoading: false,
          error: err.message
        });
      })
  }


  takePhoto = async () => {
    const {
      status: cameraPerm
    } = await Permissions.askAsync(Permissions.CAMERA);

    const {
      status: cameraRollPerm
    } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    // only if user allows permission to camera AND camera roll
    if (cameraPerm === 'granted' && cameraRollPerm === 'granted') {
      let pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });
      let uriParts = pickerResult.uri.split('.');
      let fileType = uriParts[uriParts.length - 1];

      this.setState({
        uploadStatus: true,
        avatarSource: pickerResult.uri,
        uri: pickerResult.uri,
        type: `image/${fileType}`,
        name: `photo.${fileType}`,
        originalname: `photo.${fileType}`,
      });
      global.data = new FormData();

      data.append('file', {
        uri: pickerResult.uri,
        type: `image/${fileType}`,
        name: `photo.${fileType}`,
        originalname: `photo.${fileType}`
      });

    }
  };

  selectImage = async () => {
    const {
      status: cameraRollPerm
    } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    // only if user allows permission to camera roll
    if (cameraRollPerm === 'granted') {

      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });
      let uriParts = pickerResult.uri.split('.');
      let fileType = uriParts[uriParts.length - 1];

      this.setState({
        uploadStatus: true,
        avatarSource: pickerResult.uri,
        uri: pickerResult.uri,
        type: `image/${fileType}`,
        name: `photo.${fileType}`,
        originalname: `photo.${fileType}`,
      });
      global.data = new FormData();

      data.append('file', {
        uri: pickerResult.uri,
        type: `image/${fileType}`,
        name: `photo.${fileType}`,
        originalname: `photo.${fileType}`
      });

    }

  };



  upload = async () => {
    this.setState({
      loading: true
    });
    if (!this.state.uploadStatus) {
      this.setState({ loading: null })
      return alert('Image yet to be uploaded')
    }
    if (this.state.label === '') {
      this.setState({ loading: null })
      return alert('Enter image label')
    }
    else {
      data.append('label', this.state.label);
      const config = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: data,
      };

      fetch('http://10.0.2.2:5000/upload', config)
        .then((resp) => resp.json())
        .then((res) => {
          this.setState((prevState) => ({
            label: res.label,
            hash: res.ipfsHash,
            address: res.ipfsAddress,
            transactionHash: res.transactionHash,
            blockHash: res.blockHash,
            loading: false,
            images: prevState.images.concat(res),
          }))
        })
        .catch((err) => {
          this.setState({
            loading: false,
            error: err.message
          });
        })
    }

  }

  newUploadScreen() {
    return (
      <View style={{ flex: 1, marginTop: 10 }}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View>
            <Text style={{ color: 'blue' }}>  DAPP file system using ethereum and IPFS </Text>
          </View>
          <View style={{ marginTop: '10%', flex: 1 }}>
            <TouchableOpacity onPress={() => this.selectImage()}>
              <View style={[styles.avatar, styles.avatarContainer, { marginBottom: 20 }]}>
                {this.state.avatarSource === null ? <Text>Select a Photo</Text> :
                  <Image style={styles.avatar} source={{ uri: this.state.avatarSource }} />
                }
              </View>
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <TextInput
                placeholder="Label"
                onChangeText={(label) => this.setState({ label })}
                style={styles.label}
                underlineColorAndroid="transparent"
              />
            </View>

            <View style={{ alignItems: 'center', marginTop: '10%' }}>
              <TouchableOpacity onPress={() => this.upload()} style={[styles.label, { justifyContent: 'center', backgroundColor: '#8470ff' }]}>
                <Text style={{ fontWeight: 'bold' }}>  UPLOAD </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>{
          this.state.loading !== null ? (
            this.state.loading ? (
              <Spinner size="large" />
            ) : (
                <View>

                  <TextContainer
                    first="Label"
                    second={this.state.label}
                  />

                  <TextContainer
                    first="Hash"
                    second={this.state.hash}
                  />

                  <TextContainer
                    first="Address on IPFS"
                    second={this.state.address}
                    link={() => Linking.openURL(this.state.address)}
                    style={{ color: 'blue', textDecorationLine: 'underline' }}
                  />

                  <TextContainer
                    first="Transaction Hash"
                    second={this.state.transactionHash}
                  />

                  <TextContainer
                    first="Block Hash"
                    second={this.state.blockHash}
                  />

                </View>
              )
          ) : null
        }
      </View>
    )
  }
  render() {
    if (!this.state.isReady) {
      return <AppLoading />;
    }
    return (
      <ScrollView style={styles.container}
        contentContainerStyle={{ flex: 1 }} >
        <View >
          <Header>
            <Body>{
              !this.state.clickUpload ? (
                <Title> DAPP images listing </Title>
              )
                : (
                  <Title> New Image upload </Title>
                )
            }

            </Body>
            <Right>
              <Button transparent onPress={() => this.setState({ clickUpload: !this.state.clickUpload })}>{
                !this.state.clickUpload ?
                  (<Text> HOME </Text>)
                  : (<Text> ADD </Text>)
              }
              </Button>
            </Right>
          </Header>
        </View>
        {
          this.state.clickUpload ?
            (
              this.newUploadScreen()
            )
            :
            (
              <ScrollView style={{ flex: 1 }}
                contentContainerStyle={{ flex: 1 }}>
                {
                  this.state.fetchLoading ?
                    (
                      <View style={{ flex: 1, marginTop: '40%' }}>
                        <Spinner size='large' />
                      </View>
                    )
                    : (
                      <ScrollView style={{ flex: 1 }}
                        contentContainerStyle={{ flex: 1 }}
                      >
                        <Fragment>
                          {
                            this.state.images.length === 0 ?
                              (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                  <TouchableOpacity onPress={() => this.setState({ clickUpload: !this.state.clickUpload })} style={[styles.label, { justifyContent: 'center', backgroundColor: '#8470ff' }]}>
                                    <Text style={{ fontWeight: 'bold' }}>  ADD </Text>
                                  </TouchableOpacity>
                                </View>
                              ) :
                              (
                                <FlatList
                                  data={this.state.images}
                                  extraData={this.state.images}
                                  keyExtractor={(item, index) => index.toString()}
                                  renderItem={(item, index) => {

                                    return (
                                      <Card
                                        key={index}
                                        state={this.state}
                                        createdAt={item.item.createdAt}
                                        address={item.item.ipfsAddress}
                                        blockHash={item.item.blockHash}
                                        transactionHash={item.item.transactionHash}
                                        label={item.item.label}
                                      />
                                    )

                                  }}
                                />
                              )}
                        </Fragment>
                      </ScrollView>
                    )
                }
              </ScrollView>
            )
        }
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  avatarContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatar: {
    borderRadius: width / 3,
    width: width / 2,
    height: width / 2
  },
  label: {
    height: 40,
    width: width / 4,
    paddingLeft: '8%',
    borderWidth: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

