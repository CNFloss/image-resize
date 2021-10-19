import React from "react";
import { Layout, Button, Toast, Stack, Frame } from "@shopify/polaris";
import { Context } from "@shopify/app-bridge-react";

class ApplyProductImageResize extends React.Component {
  static contextType = Context;

  state = {
    open: false,
    medium: {
      width: "2048",
      height: "2048",
    },
    portrait: {
      width: "2048",
      height: "2731",
    },
    newImages: [],
  };

  render() {
    const payload = JSON.stringify({ data: "will this work?" });
    const productImageUpdate = async (id, url, size) => {
      try {
        const res = await this.props.fetch(
          "products?" +
            new URLSearchParams({
              id: id,
              url: url,
              width: size.width,
              height: size.height,
            }),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: payload,
          }
        );
        return await res.json();
      } catch (error) {
        console.log(error);
      }
    };

    const productImageRevert = async (id, imageId) => {
      try {
        const res = await this.props.fetch(
          "products?" +
            new URLSearchParams({
              id: id,
              imageId: imageId,
            }),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return await res.json();
      } catch (error) {
        console.log(error);
      }
    };

    const productImageDelete = async (id, imageId) => {
      try {
        const res = await this.props.fetch(
          "products?" +
            new URLSearchParams({
              id: id,
              imageId: imageId,
            }),
          {
            method: "DELETE",
          }
        );
        return await res.json();
      } catch (error) {
        console.log(error);
      }
    };

    const toastMarkup = this.state.open ? (
      <Toast
        content="Images Resized"
        onDismiss={() => {
          this.setState({ open: false });
        }}
      />
    ) : null;

    return (
      <Frame>
        <Layout.Section>
          {toastMarkup}
          <Stack distribution={"center"}>
            <Button
              primary
              textAlign={"center"}
              onClick={() => {
                let temp = [];
                for (const variantId in this.props.selectedItems) {
                  console.log(variantId, this.props.selectedItems);
                  temp.push(
                    productImageUpdate(
                      variantId,
                      this.props.selectedItems[variantId].image.src,
                      this.state.medium
                    ).then((data) => {
                      return data;
                    })
                  );
                }
                Promise.allSettled(temp).then((values) => {
                  this.setState({
                    open: true,
                    newImages: values.map((res) => res.value.image),
                  });
                });
              }}
            >
              Image Resize Landscape
            </Button>
            <Button
              primary
              textAlign={"center"}
              onClick={() => {
                let temp = [];
                for (const variantId in this.props.selectedItems) {
                  temp.push(
                    productImageUpdate(
                      variantId,
                      this.props.selectedItems[variantId].image.src,
                      this.state.portrait
                    )
                  );
                }
                Promise.allSettled(temp).then((values) => {
                  this.setState({ open: true });
                });
              }}
            >
              Image Resize Portrait
            </Button>
            {this.state.newImages.length > 0 ? (
              <Button
                primary
                textAlign={"center"}
                onClick={() => {
                  let temp = [];
                  for (const variantId in this.props.selectedItems) {
                    temp.push(
                      productImageRevert(
                        variantId,
                        this.props.selectedItems[variantId].image.id
                      ).then((value) => {
                        productImageDelete(
                          variantId,
                          this.props.selectedItems[variantId].image.id
                        ).then((data) => {
                          return data;
                        });
                      })
                    );
                  }
                  Promise.allSettled(temp).then((values) => {
                    this.setState({ newImages: [] });
                    return this.props.updateParent();
                  });
                }}
              >
                Revert Changes
              </Button>
            ) : null}
          </Stack>
        </Layout.Section>
      </Frame>
    );
  }
}

export default ApplyProductImageResize;
