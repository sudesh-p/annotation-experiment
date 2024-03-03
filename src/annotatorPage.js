import React from 'react';
import { useParams } from 'react-router-dom';
import Footer from './Footer';

export default function AnnotatorPage() {
  let { name } = useParams();

  return (
    <div id="root">
      <h2>Welcome to the Annotation, {name}</h2> <br />
      {/* Annotator-specific content goes here. */}
      <Footer/>
    </div>
  );
}