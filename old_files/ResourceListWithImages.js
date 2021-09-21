import React from 'react';
import gql from 'graphql-tag';
import { Query, Mutation, useMutation } from 'react-apollo';
import { TextStyle, Thumbnail, Card, ResourceItem, ResourceList } from "@shopify/polaris";

const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
              id
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              price
              id
            }
          }
        }
      }
    }
  }
`;

const RESIZE_PRODUCT_IMAGE = gql`
  mutation productImageUpdate($productId: ID!, $image: ImageInput!) {
    productImageUpdate(productId: $productId, image: $image) {
      image {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

class ResourceListWithImages extends React.Component {
  render() {
    if (!!this.props.state.resourceIDs) {
      return (
        <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: this.props.state.resourceIDs }}>
          {({ data, loading, error }) => {
            if (loading) return <div>Loading…</div>;
            if (error) return <div>{error.message}</div>;
              console.log(data.nodes);
              return (
                <Card>
                  <ResourceList
                    resourceName={{singular: 'customer', plural: 'customers'}}
                    items={data.nodes}
                    renderItem={(item) => {
                      const imageMeta = {id: item.images.edges[0].node.id, src: item.images.edges[0].node.originalSrc}
                      const [resizeImage, data] = useMutation(RESIZE_PRODUCT_IMAGE)

                      const shortcutActions = [
                        {
                          content: 'Resize Product image',
                          accessibilityLabel: `resize ${item.title}’s image`,
                          onAction: async () => {
                            await resizeImage({variables:{productId:item.id, image:imageMeta}});
                          },
                        },
                      ]
                      console.log(item.id);
                      return (
                        <ResourceItem
                          id={item.title}
                          accessibilityLabel={`View details for ${item}`}
                          shortcutActions={shortcutActions}
                        >
                        <h3>
                          <TextStyle variation="strong">{item.title}</TextStyle>
                        </h3>
                        <Thumbnail
                          source={item.images.edges[0].node.originalSrc}
                          alt="Black choker necklace"
                        />
                        </ResourceItem>
                      );
                    }}
                  />
                </Card>
              );
          }}
        </Query>
      );
    } else {
      return null;
    }
  }
}

export default ResourceListWithImages;