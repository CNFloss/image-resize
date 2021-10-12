import React, { useState } from "react";
import { Layout, Button, TextField, Stack, Frame } from "@shopify/polaris";
import { Context } from "@shopify/app-bridge-react";

class ApplyProductImageResize extends React.Component {
  static contextType = Context;

  state = {
    width: "2048",
    height: "2048",
  };

  render() {
    const productImageUpdate = async (id, url, width, height) => {
      const res = await this.props.fetch(
        "products?" +
          new URLSearchParams({
            id: id,
            url: url,
            width: width,
            height: height,
          }),
        {
          method: "POST",
        }
      );
      try {
        return await res.json();
      } catch (error) {
        console.log(error);
      }
    };
    console.log(this);
    return (
      <Frame>
        <Layout.Section>
          <Stack distribution={"center"}>
            <TextField
              label="Set Width"
              type="number"
              value={this.state.width}
              onChange={(value) => {
                console.log(value, this.state.width);
                this.setState({ width: value });
              }}
              autoComplete="off"
            />
            <TextField
              label="Set Height"
              type="number"
              value={this.state.height}
              onChange={(value) => {
                console.log(value, this.state.height);
                this.setState({ height: value });
              }}
              autoComplete="off"
            />
            <Button
              primary
              textAlign={"center"}
              onClick={() => {
                for (const variantId in this.props.selectedItems) {
                  console.log(this.props.selectedItems[variantId]);

                  productImageUpdate(
                    variantId,
                    this.props.selectedItems[variantId].image.src,
                    this.state.width,
                    this.state.height
                  );
                }
              }}
            >
              Image Resize Medium
            </Button>
          </Stack>
        </Layout.Section>
      </Frame>
    );
  }
}

export default ApplyProductImageResize;
