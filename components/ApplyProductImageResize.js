import React, { useState } from "react";
import { Layout, Button, Banner, Toast, Stack, Frame } from "@shopify/polaris";
import { Context } from "@shopify/app-bridge-react";

class ApplyProductImageResize extends React.Component {
  static contextType = Context;

  render() {
    const productImageUpdate = async (id, url) => {
      const res = await this.props.fetch(
        "products?" + new URLSearchParams({ id: id, url: url }),
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

    return (
      <Frame>
        <Layout.Section>
          <Stack distribution={"center"}>
            <Button
              primary
              textAlign={"center"}
              onClick={() => {
                for (const variantId in this.props.selectedItems) {
                  console.log(this.props.selectedItems[variantId]);

                  productImageUpdate(
                    variantId,
                    this.props.selectedItems[variantId].image.src
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
