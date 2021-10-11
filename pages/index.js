import React from "react";
import { Page, Layout, EmptyState } from "@shopify/polaris";
import { ResourcePicker, TitleBar } from "@shopify/app-bridge-react";
import store from "store-js";
import ResourceListWithProducts from "../components/ResourceList";

const img = "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";

class Index extends React.Component {
  state = {
    open: false,
    selectedProducts: null,
  };
  render() {
    // A constant that defines your app's empty state
    const emptyState = !this.state.selectedProducts;

    const product = async (limit, sinceId) => {
      const res = await this.props.fetch("/products?" + sinceId);
      return await res.json();
    };

    return (
      <Page>
        <TitleBar
          primaryAction={{
            content: "Select products",
            onAction: () => this.setState({ open: true }),
          }}
        />
        <ResourcePicker
          resourceType="Product"
          showVariants={false}
          open={this.state.open}
          onSelection={(resources) => {
            const idsFromResources = resources.selection.map((product) => {
              return product.id.substring(
                product.id.lastIndexOf("/") + 1,
                product.id.length
              );
            });
            let productsTempArray = [];
            for (let prod of idsFromResources) {
              let temp = product(0, prod).then((data) => {
                return data.body.product;
              });
              productsTempArray.push(temp);
            }
            Promise.all(productsTempArray).then((values) => {
              console.log(values);
              this.setState({
                selectedProducts: values,
                open: false,
              });
              store.set("ids", idsFromResources);
            });
          }}
          onCancel={() => this.setState({ open: false })}
        />
        {emptyState ? ( // Controls the layout of your app's empty state
          <Layout>
            <EmptyState
              heading="Resize Image Products"
              action={{
                content: "Select products",
                onAction: () => this.setState({ open: true }),
              }}
              image={img}
            >
              <p>Select products to resize their images.</p>
            </EmptyState>
          </Layout>
        ) : (
          // Uses the new resource list that retrieves products by IDs
          <ResourceListWithProducts
            key={this.state.selectedProducts[0].id}
            products={this.state.selectedProducts}
            fetch={this.props.fetch}
          />
        )}
      </Page>
    );
  }
}

export default Index;
