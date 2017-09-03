import * as React from 'react';
import cxs from 'cxs';

const scrollAreaClass = cxs({
    overflow: 'hidden'
});

const scrollAreaContent = cxs({
    position: 'absolute',
    left: 0,
    top: 0,
    right: '20px',
    bottom: 0
});

const scrollBarClass = cxs({
    position: 'absolute',
    right: '1px',
    width: '5px',
    top: 0,
    bottom: 0,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '2px'
});

const scrollHandleClass = cxs({
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    background: 'rgba(255,255,255,0.4)',
    borderRadius: '2px'
});

type Props = {
    className?: string;
    scrollY: number;
    onScroll(value: number);
}

type State = {
    hidden: boolean;
    handleHeight: number;
    contentHeight: number;
    scrollHeight: number;
}

export default class ScrollArea extends React.Component<Props,State> {
    private root: HTMLElement;
    private content: HTMLElement;
    private handle: HTMLElement;
    private startY: number;
    private originalY: number;

    state = {
        hidden: true,
        handleHeight: 20,
        scrollHeight: 0,
        contentHeight: 0
    }

    render(){
        let className = this.props.className || '';
        className += ' ' + scrollAreaClass;

        const contentStyle = {
            scrollTop: this.props.scrollY
        };
  
        return (
            <div ref={root => this.root = root} className={className} onWheel={this.onWheel}>
                <div ref={content => this.content = content} className={scrollAreaContent} style={{top: -this.props.scrollY}}>
                    {this.props.children}
                </div>
                {this.renderScrollbar()}
            </div>
        );
    }
    
    renderScrollbar(){
        if(this.state.hidden){
            return;
        }
        const handleStyle = {
            top: this.props.scrollY,
            height: `${this.state.handleHeight}px`
        };
        return (
            <div className={scrollBarClass} onMouseDown={this.onScrollbarMouseDown}>
                <div className={scrollHandleClass} 
                    style={handleStyle} 
                    onMouseDown={this.onHandleMouseDown}
                    ref={handle => this.handle = handle}>
                </div>
            </div>
        );
    }

    componentDidMount(){
        this.resizeHandle();
        this.content.scrollTop = this.props.scrollY;
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.children !== this.props.children){
            this.resizeHandle();
        }
    }

    private onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        this.onScroll((this.props.scrollY || 0) + event.deltaY);
    }

    private onScrollbarMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        
        const rect = this.root.getBoundingClientRect();
        let newValue = event.pageY - rect.top;
        newValue -= this.state.handleHeight / 2;
        this.onScroll(newValue);
    }

    private onHandleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        this.startY = event.pageY;
        this.originalY = this.props.scrollY;
        document.addEventListener('mousemove', this.onMouseMove, true);
        document.addEventListener('mouseup', this.onMouseUp, true);
    }

    private onMouseDown = (event) => {
        event.preventDefault();
        this.startY = event.pageY;
        this.originalY = this.props.scrollY;
        this.onMouseMove(event);
        document.addEventListener('mousemove', this.onMouseMove, true);
        document.addEventListener('mouseup', this.onMouseUp, true);
        return false;
    };

    private onMouseMove = (event: MouseEvent) => {
        const rect = this.root.getBoundingClientRect();
        let newValue = event.pageY - this.startY + this.originalY;
        this.onScroll(newValue);
    };

    private onMouseUp = () => {
        document.removeEventListener('mousemove', this.onMouseMove, true);
        document.removeEventListener('mouseup', this.onMouseUp, true);
    };

    private resizeHandle = () => {
        const scrollHeight = this.content.scrollHeight;
        const offsetHeight = this.content.offsetHeight;
        if(scrollHeight <= offsetHeight){
            this.setState({
                hidden: true,
                handleHeight: (offsetHeight / scrollHeight) * offsetHeight,
                contentHeight: this.content.offsetHeight,
                scrollHeight: this.content.scrollHeight
            });
        } else {
            this.setState({
                hidden: false,
                handleHeight: (offsetHeight / scrollHeight) * offsetHeight,
                contentHeight: this.content.offsetHeight,
                scrollHeight: this.content.scrollHeight
            });
        }
    };

    private onScroll = (newValue: number) => {
        if(newValue < 0){
            newValue = 0;
        }
        if(newValue > this.content.offsetHeight - this.state.handleHeight) {
            newValue = this.content.offsetHeight - this.state.handleHeight;
        }
        this.props.onScroll(newValue);
    } 
}