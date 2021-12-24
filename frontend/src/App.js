import { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Search from './components/Search';
import ImageCard from './components/ImageCard';
import Spinner from './components/Spinner';
import { Container, Row, Col } from 'react-bootstrap';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5050';

const App = () => {
  const [word, setWord] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const getSavedImages = async () => {
    try {
      const res = await axios.get(`${API_URL}/images`);
      setImages(res.data || []);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => getSavedImages(), []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.get(`${API_URL}/new-image?query=${word}`);
      setImages([{ ...res.data, title: word }, ...images]);
    } catch (error) {
      console.log(error);
    }

    setWord('');
  };

  const handleDeleteImage = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/images/${id}`);
      if (res.data?.deleted_id) {
        setImages(images.filter((image) => image.id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveImage = async (id) => {
    // Find the id of the current image (which is being saved)
    const imageToBeSaved = images.find((image) => image.id === id);
    // Add a property called saved to the current image
    imageToBeSaved.saved = true;

    try {
      // Post the image to be saved (which will now include the imageToBeSaved field)
      const res = await axios.post(`${API_URL}/images`, imageToBeSaved);
      // If the image is posted to the db without error (which you can tell from the inserted_id field), then....
      if (res.data?.inserted_id) {
        // Take the images array in the state and iterate over it, pick out the image whose id matches the image being saved and add the saved field to just that image,
        // otherwise, just leave the image as it is (without the saved field)
        setImages(
          images.map((image) =>
            image.id === id ? { ...image, saved: true } : image
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Header title="Images Gallery" />
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Search
            word={word}
            setWord={setWord}
            handleSubmit={handleSearchSubmit}
          />
          <Container className="mt-4">
            <Row xs={1} md={2} lg={3}>
              {images.map((image, i) => (
                <Col key={i} className="pb-3">
                  <ImageCard
                    image={image}
                    deleteImage={handleDeleteImage}
                    saveImage={handleSaveImage}
                  />
                </Col>
              ))}
            </Row>
          </Container>
        </>
      )}
    </div>
  );
};

export default App;
