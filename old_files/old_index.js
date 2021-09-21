import { Page } from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";
import ResourceListWithImages from "../components/ResourceListWithImages"

class Index extends React.Component {
  state = {
    open: false,
    resourceIDs: null
  }

  render() {
    return (
      <div>
        <Page
          title="Product Image Resizer"
          primaryAction={{
            content: "Select Products",
            onAction: () => this.setState({ open: true })
          }}
        >
          <ResourcePicker
            selectMultiple={true}
            resourceType="Product"
            open={this.state.open}
            onCancel={() => this.setState({open: false})}
            onSelection={(resources) => this.handleSelection(resources)}
          />
        </Page>
        <ResourceListWithImages state={this.state} />
      </div>
    )
  }
  handleSelection = (resources) => {
    const idFromResources = resources.selection.map((product) => {
      return product.id
    });
    this.setState({open: false});
    this.setState({resourceIDs: idFromResources});
  }
}

export default Index;
