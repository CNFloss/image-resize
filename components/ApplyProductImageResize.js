import React, { useState } from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { Layout, Button, Banner, Toast, Stack, Frame } from '@shopify/polaris';
import { Context } from '@shopify/app-bridge-react';

const RESIZE_PRODUCT_IMAGE = gql`
  mutation productImageUpdate($productId: ID!, $image: ImageInput!, $maxWidth: Int!, $maxHeight: Int!) {
    productImageUpdate(productId: $productId, image: $image) {
      image {
        id
        originalSrc: transformedSrc(maxWidth: $maxWidth, maxHeight: $maxHeight)
      }
      userErrors {
        field
        message
      }
    }
  }
`;

class ApplyProductImageResize extends React.Component {
  static contextType = Context;

  render() {
    return ( // Uses mutation's input to update product prices
      <Mutation mutation={RESIZE_PRODUCT_IMAGE}>
        {(handleSubmit, {error, data}) => {
          if (!!data) console.log(data)
          const [hasResults, setHasResults] = useState(false);

          const showError = error && (
            <Banner status="critical">{error.message}</Banner>
          );

          const showToast = hasResults && (
            <Toast
              content="Successfully updated"
              onDismiss={() => setHasResults(false)}
            />
          );

          return (
            <Frame>
              {showToast}
              <Layout.Section>
                {showError}
              </Layout.Section>

              <Layout.Section>
                <Stack distribution={"center"}>
                  <Button
                    primary
                    textAlign={"center"}
                    onClick={() => {
                      let promise = new Promise((resolve) => resolve());
                      for (const variantId in this.props.selectedItems) {
                        const productImageInput = {
                          id: this.props.selectedItems[variantId].images.edges[0].node.id,
                          src: this.props.selectedItems[variantId].images.edges[0].node.originalSrc
                        }
                        
                        promise = promise.then(() => handleSubmit(
                          { variables: { productId: this.props.selectedItems[variantId].id, image:productImageInput, maxWidth:2048, maxHeight:2048 } }
                        ));
                      }

                      if (promise) {
                        promise.then(() => this.props.onUpdate().then(() => setHasResults(true)));
                    }}
                  }
                  >
                    Resize Product Images
                  </Button>
                </Stack>
              </Layout.Section>
            </Frame>
          );
        }}
      </Mutation>
    );
  }
}

export default ApplyProductImageResize;
