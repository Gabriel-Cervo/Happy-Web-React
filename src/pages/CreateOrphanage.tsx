import React, { useState, FormEvent, ChangeEvent } from "react";
import { Map, Marker, TileLayer, } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import { FiPlus } from "react-icons/fi";

import '../styles/pages/create-orphanage.css';
import Sidebar from "../components/Sidebar";
import mapIcon from "../utils/mapIcon";
import api from "../services/api";
import { useHistory } from "react-router-dom";

export default function CreateOrphanage() {
  const history = useHistory();

  const [latLng, setLatLng] = useState({ latitude: 0, longitude: 0 });
  const [input, setInput] = useState({
    name: '',
    about: '',
    instructions: '',
    opening_hours: ''
  });
  const [open_on_weekends, setOpenOnWeekends] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  function handleMapClick(e: LeafletMouseEvent) {
    const { lat, lng } = e.latlng
    setLatLng({
      latitude: lat,
      longitude: lng
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    const { name, value } = e.target;
    setInput(prevState => {
      return { ...prevState, [name]: value }
    });
  }

  function handleSelectImages(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }

    const selectedImages = Array.from(e.target.files)

    setImages(selectedImages);

    const selectedImagesPreview = selectedImages.map(image => {
      return URL.createObjectURL(image);
    });

    setPreviewImages(selectedImagesPreview);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const { latitude, longitude } = latLng;

    const data = new FormData();
    data.append('name', input.name);
    data.append('about', input.about);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('instructions', input.instructions);
    data.append('opening_hours', input.opening_hours);
    data.append('open_on_weekends', String(open_on_weekends));

    images.forEach(image => {
      data.append('images', image);
    });

    await api.post('/orphanages', data);

    setInput({
      name: '',
      about: '',
      instructions: '',
      opening_hours: ''
    });

    alert('cadastro realizado com sucesso!');

    history.push('/app');
  }

  return (
    <div id="page-create-orphanage">
      <Sidebar />

      <main>
        <form className="create-orphanage-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Dados</legend>

            <Map
              center={[-30.0724898, -51.1628787]}
              style={{ width: '100%', height: 280 }}
              zoom={15}
              onClick={handleMapClick}
            >
              <TileLayer
                url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
              />

              {latLng.latitude !== 0 && <Marker interactive={false} icon={mapIcon} position={[latLng.latitude, latLng.longitude]} />}

              {}
            </Map>

            <div className="input-block">
              <label htmlFor="name">Nome</label>
              <input id="name" name="name" value={input.name} onChange={handleChange} />
            </div>

            <div className="input-block">
              <label htmlFor="about">Sobre <span>Máximo de 300 caracteres</span></label>
              <textarea id="name" name="about" maxLength={300} value={input.about} onChange={handleChange} />
            </div>

            <div className="input-block">
              <label htmlFor="images">Fotos</label>

              <div className="images-container">
                {previewImages.map(image => {
                  return (
                    <img key={image} src={image} alt={input.name} />
                  );
                })}

                <label htmlFor="image[]" className="new-image">
                  <FiPlus size={24} color="#15b6d6" />
                </label>
              </div>

              <input type="file" id="image[]" multiple onChange={handleSelectImages} />



            </div>
          </fieldset>

          <fieldset>
            <legend>Visitação</legend>

            <div className="input-block">
              <label htmlFor="instructions">Instruções</label>
              <textarea id="instructions" name="instructions" value={input.instructions} onChange={handleChange} />
            </div>

            <div className="input-block">
              <label htmlFor="opening_hours">Horário de funcionamento</label>
              <input id="opening_hours" name="opening_hours" value={input.opening_hours} onChange={handleChange} />
            </div>

            <div className="input-block">
              <label htmlFor="open_on_weekends">Atende fim de semana</label>

              <div className="button-select">
                <button type="button" className={open_on_weekends ? 'active' : ''} onClick={() => setOpenOnWeekends(true)}>Sim</button>
                <button type="button" className={!open_on_weekends ? 'active' : ''} onClick={() => setOpenOnWeekends(false)}>Não</button>
              </div>
            </div>
          </fieldset>

          <button className="confirm-button" type="submit">
            Confirmar
          </button>
        </form>
      </main>
    </div>
  );
}

// return `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`;
