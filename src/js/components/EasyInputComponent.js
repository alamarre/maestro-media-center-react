import React from 'react'

class EasyInputComponent extends React.Component {

    constructor(props) {
        super(props);
        
        this.handleInputChange = this.handleInputChange.bind(this);
        this.toggleSetting = this.toggleSetting.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
    
        this.setState({[name]: value});
        if(this.props.settingsManager) {
            this.props.settingsManager.set(name, value);
        }
    }

    toggleSetting(event) {
        const target = event.target;
        const name = target.name;
        let desiredState = {[name]: !this.state[name]};
        this.setState(desiredState);
    }
}

module.exports = EasyInputComponent;
