import React, { useState } from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { Context } from "@shopify/app-bridge-react";
import Pica from "pica";

class ViewImageManipulation extends React.Component {
  static contextType = Context;

  render() {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 2048;
    const pica = Pica();
    let selected = [];
    let newURL = function (url) {
      if (!url) return null;
      return url;
    };
    var secondImgLoad = function () {
      //URL.revokeObjectURL(newURL);
      console.log("image resized!");
    };
    const exampleImg = newURL && (
      <img src={newURL} crossOrigin="Anonymous" onLoad={secondImgLoad}></img>
    );
    if (Object.keys(this.props.selectedItems).length !== 0) {
      for (const variantId in this.props.selectedItems) {
        selected.push(this.props.selectedItems[variantId]);
      }
      let imgLoad = function (props) {
        let img = new Image(2048, 2048);
        img.crossOrigin = "Anonymous";
        img.src = selected[0].images.edges[0].node.originalSrc;
        img.onload = function () {
          pica
            .resize(img, canvas, {
              quality: 0,
            })
            .then((result) => pica.toBlob(result, "image/jpeg", 0.9))
            .then((blob) => (newURL = URL.createObjectURL(blob)))
            .then(() => props.onUpdate())
            .then(() => console.log(newURL));
        };
      };
      console.log(selected[0].images.edges[0].node.originalSrc);
      return (
        <div>
          <img
            src={selected[0].images.edges[0].node.originalSrc}
            crossOrigin="Anonymous"
            onLoad={imgLoad(this.props)}
          ></img>
          {exampleImg}
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}

export default ViewImageManipulation;
