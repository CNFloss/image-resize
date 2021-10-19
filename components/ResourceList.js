import React from "react";
import { ResourceList, Stack, TextStyle, Thumbnail } from "@shopify/polaris";
import { Context } from "@shopify/app-bridge-react";
import ApplyProductImageResize from "./ApplyProductImageResize";

class ResourceListWithProducts extends React.Component {
  static contextType = Context;

  // A constructor that defines selected items and nodes
  constructor(props) {
    super(props);

    this.state = {
      selectedItems: [],
      selectedNodes: {},
    };
  }
  updateSelectedItems() {
    const product = async (limit, sinceId) => {
      const res = await this.props.fetch("/products?" + sinceId);
      return await res.json();
    };
    const productsTempArray = this.state.selectedItems.map((selected) =>
      product(0, selected).then((data) => data.body.product)
    );

    let temp = {};
    Promise.allSettled(productsTempArray).then((values) => {
      values.forEach((val, i) => {
        temp[`${this.state.selectedItems[i]}`] = val.value;
      });
      this.setState({
        selectedNodes: temp,
      });
    });
  }

  render() {
    const nodesById = {};
    this.props.products.forEach((node) => (nodesById[node.id] = node));

    return (
      <>
        <ResourceList
          showHeader
          resourceName={{ singular: "Product", plural: "Products" }}
          items={this.props.products}
          selectable
          selectedItems={this.state.selectedItems}
          onSelectionChange={(selectedItems) => {
            const selectedNodes = {};
            selectedItems.forEach(
              (item) => (selectedNodes[item] = nodesById[item])
            );
            console.log(selectedItems);
            return this.setState({
              selectedItems: selectedItems,
              selectedNodes: selectedNodes,
            });
          }}
          renderItem={(item) => {
            const media = (
              <Thumbnail
                source={item.image ? item.image.src : ""}
                alt={item.image ? item.image.alt : ""}
              />
            );
            return (
              <ResourceList.Item
                id={item.id}
                media={media}
                accessibilityLabel={`View details for ${item.title}`}
                verticalAlignment="center"
                onClick={() => {
                  let index = this.state.selectedItems.indexOf(item.id);
                  const node = nodesById[item.id];

                  if (index === -1) {
                    this.state.selectedItems.push(item.id);
                    this.state.selectedNodes[item.id] = node;
                  } else {
                    this.state.selectedItems.splice(index, 1);
                    delete this.state.selectedNodes[item.id];
                  }

                  this.setState({
                    selectedItems: this.state.selectedItems,
                    selectedNodes: this.state.selectedNodes,
                  });
                }}
              >
                <Stack alignment="center">
                  <Stack.Item fill>
                    <h3>
                      <TextStyle variation="strong">{item.title}</TextStyle>
                    </h3>
                    Suggested Size:{" "}
                    {item.image.height / item.image.width < 1.3
                      ? "Landscape,"
                      : "Portrait,"}{" "}
                    Needed?:{" "}
                    {Math.round((item.image.height / item.image.width) * 10) /
                      10 ===
                      1 ||
                    Math.round((item.image.height / item.image.width) * 10) /
                      10 ===
                      1.3
                      ? "No,"
                      : "Yes,"}{" "}
                    Ratio:{" "}
                    {Math.round((item.image.height / item.image.width) * 10) /
                      10}
                  </Stack.Item>
                </Stack>
              </ResourceList.Item>
            );
          }}
        />
        <ApplyProductImageResize
          selectedItems={this.state.selectedNodes}
          fetch={this.props.fetch}
          updateParent={this.updateSelectedItems.bind(this)}
        />
      </>
    );
  }
}

export default ResourceListWithProducts;
