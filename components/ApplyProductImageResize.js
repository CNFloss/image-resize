import React, { useState } from "react";
import { Layout, Button, Banner, Toast, Stack, Frame } from "@shopify/polaris";
import { Context } from "@shopify/app-bridge-react";
import Pica from "pica";

class ApplyProductImageResize extends React.Component {
  static contextType = Context;

  render() {
    const productImageUpdate = async (id, src) => {
      const res = await this.props.fetch("/products", {
        method: "POST",
        data: src,
      });
      return await res.json();
    };
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 2048;
    const pica = Pica();

    function readFile(file) {
      return new Promise((resolve, reject) => {
        var fr = new FileReader();
        fr.onload = () => {
          let base64String = "";
          base64String = fr.result.replace("data:", "").replace(/^.+,/, "");

          resolve(base64String);
        };
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
    }

    return (
      <Frame>
        <Layout.Section>
          <Stack distribution={"center"}>
            <Button
              primary
              textAlign={"center"}
              onClick={() => {
                let promise = new Promise((resolve) => resolve());
                for (const variantId in this.props.selectedItems) {
                  const canvas = document.createElement("canvas");
                  canvas.width = 2048;
                  canvas.height = 2048;
                  let img = new Image(
                    this.props.selectedItems[variantId].image.width,
                    this.props.selectedItems[variantId].image.height
                  );
                  img.crossOrigin = "Anonymous";
                  img.src = this.props.selectedItems[variantId].image.src;
                  promise = pica
                    .resize(img, canvas)
                    .then((result) => {
                      return pica.toBlob(result, "image/jpeg");
                    })
                    .then((blob) => {
                      return readFile(blob);
                    })
                    .then((url) => {
                      console.log(url);
                      productImageUpdate(variantId, url);
                      return { src: url };
                    });
                }
              }}
            >
              Crop Product Images
            </Button>
          </Stack>
        </Layout.Section>
      </Frame>
    );
  }
}

export default ApplyProductImageResize;
