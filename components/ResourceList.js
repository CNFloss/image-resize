import React from "react";
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
} from "@shopify/polaris";
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

  render() {
    const nodesById = {};
    console.log(this.props.products);
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
            console.log(selectedNodes);
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
                  </Stack.Item>
                </Stack>
              </ResourceList.Item>
            );
          }}
        />
        <ApplyProductImageResize
          selectedItems={this.state.selectedNodes}
          fetch={this.props.fetch}
        />
      </>
    );
  }
}

export default ResourceListWithProducts;
