"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrowContainer = void 0;
var react_1 = __importDefault(require("react"));
var ArrowContainer_1 = require("./ArrowContainer");
Object.defineProperty(exports, "ArrowContainer", { enumerable: true, get: function () { return ArrowContainer_1.ArrowContainer; } });
var PopoverPortal_1 = require("./PopoverPortal");
var util_1 = require("./util");
var DEFAULT_POSITION_ORDER = ['top', 'right', 'left', 'bottom'];
var Popover = /** @class */ (function (_super) {
    __extends(Popover, _super);
    function Popover(props) {
        var _this = _super.call(this, props) || this;
        _this.targetRef = react_1.default.createRef();
        _this.targetRect = undefined;
        _this.targetPositionIntervalHandler = undefined;
        _this.popoverDiv = undefined;
        _this.positionOrder = undefined;
        _this.willUnmount = false;
        _this.willMount = false;
        _this.stopPropagation = true;
        _this.onClick = function (e) {
            var _a = _this.props, onClickOutside = _a.onClickOutside, isOpen = _a.isOpen;
            if (_this.stopPropagation)
                e.stopPropagation();
            if (!_this.willUnmount &&
                !_this.willMount &&
                !_this.popoverDiv.contains(e.target) &&
                !_this.targetRef.current.contains(e.target) &&
                onClickOutside &&
                isOpen) {
                onClickOutside(e);
            }
        };
        _this.onResize = function () {
            _this.renderPopover();
        };
        _this.state = {
            popoverInfo: undefined,
            isTransitioningToClosed: false,
            internalisOpen: false,
        };
        _this.willUnmount = false;
        _this.willMount = true;
        return _this;
    }
    Popover.getDerivedStateFromProps = function (props, state) {
        var internalisOpen = state.internalisOpen, isTransitioningToClosed = state.isTransitioningToClosed;
        var isOpen = props.isOpen;
        if (internalisOpen === true && isOpen === false && !isTransitioningToClosed) {
            return {
                internalisOpen: false,
                isTransitioningToClosed: true,
            };
        }
        // eslint-disable-next-line no-restricted-syntax
        return null;
    };
    Popover.prototype.componentDidMount = function () {
        var _this = this;
        window.setTimeout(function () { return (_this.willMount = false); });
        var _a = this.props, position = _a.position, isOpen = _a.isOpen, stopPropagation = _a.stopPropagation;
        this.stopPropagation = stopPropagation;
        this.positionOrder = this.getPositionPriorityOrder(position);
        this.updatePopover(isOpen);
    };
    Popover.prototype.componentDidUpdate = function (prevProps) {
        var prevIsOpen = prevProps.isOpen, prevAlign = prevProps.align, prevPosition = prevProps.position, prevTransitionDuration = prevProps.transitionDuration, prevPadding = prevProps.padding, prevWindowBorderPadding = prevProps.windowBorderPadding;
        var _a = this.props, isOpen = _a.isOpen, position = _a.position, transitionDuration = _a.transitionDuration, align = _a.align, contentDestination = _a.contentDestination, padding = _a.padding, windowBorderPadding = _a.windowBorderPadding;
        this.positionOrder = this.getPositionPriorityOrder(position);
        var hasNewDestination = prevProps.contentDestination !== contentDestination;
        if (prevIsOpen !== isOpen ||
            prevAlign !== align ||
            prevPosition !== position ||
            prevPadding !== padding ||
            prevWindowBorderPadding !== windowBorderPadding ||
            hasNewDestination) {
            this.updatePopover(isOpen);
        }
        if (prevTransitionDuration !== transitionDuration) {
            this.popoverDiv.style.transition = "opacity " + transitionDuration + "s";
        }
    };
    Popover.prototype.componentWillUnmount = function () {
        this.willUnmount = true;
        window.clearTimeout(this.removePopoverTimeout);
        window.clearInterval(this.targetPositionIntervalHandler);
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('click', this.onClick);
        this.removePopover();
    };
    Popover.prototype.getNudgedPopoverPosition = function (_a) {
        var top = _a.top, left = _a.left, width = _a.width, height = _a.height;
        var padding = this.props.windowBorderPadding;
        top = top < padding ? padding : top;
        top = top + height > window.innerHeight - padding ? window.innerHeight - padding - height : top;
        left = left < padding ? padding : left;
        left = left + width > window.innerWidth - padding ? window.innerWidth - padding - width : left;
        return { top: top, left: left };
    };
    Popover.prototype.getPositionPriorityOrder = function (position) {
        if (position && typeof position !== 'string') {
            if (util_1.Constants.DEFAULT_POSITIONS.every(function (defaultPosition) { return position.find(function (p) { return p === defaultPosition; }) !== undefined; })) {
                return util_1.arrayUnique(position);
            }
            var remainingPositions = util_1.Constants.DEFAULT_POSITIONS.filter(function (defaultPosition) { return position.find(function (p) { return p === defaultPosition; }) === undefined; });
            return util_1.arrayUnique(__spreadArrays(position, remainingPositions));
        }
        if (position && typeof position === 'string') {
            var remainingPositions = util_1.Constants.DEFAULT_POSITIONS.filter(function (defaultPosition) { return defaultPosition !== position; });
            return util_1.arrayUnique(__spreadArrays([position], remainingPositions));
        }
        return DEFAULT_POSITION_ORDER;
    };
    Popover.prototype.getLocationForPosition = function (position, newTargetRect, popoverRect) {
        var _a = this.props, padding = _a.padding, align = _a.align;
        var targetMidX = newTargetRect.left + newTargetRect.width / 2;
        var targetMidY = newTargetRect.top + newTargetRect.height / 2;
        var top;
        var left;
        switch (position) {
            case 'top':
                top = newTargetRect.top - popoverRect.height - padding;
                left = targetMidX - popoverRect.width / 2;
                if (align === 'start') {
                    left = newTargetRect.left;
                }
                if (align === 'end') {
                    left = newTargetRect.right - popoverRect.width;
                }
                break;
            case 'left':
                top = targetMidY - popoverRect.height / 2;
                left = newTargetRect.left - padding - popoverRect.width;
                if (align === 'start') {
                    top = newTargetRect.top;
                }
                if (align === 'end') {
                    top = newTargetRect.bottom - popoverRect.height;
                }
                break;
            case 'bottom':
                top = newTargetRect.bottom + padding;
                left = targetMidX - popoverRect.width / 2;
                if (align === 'start') {
                    left = newTargetRect.left;
                }
                if (align === 'end') {
                    left = newTargetRect.right - popoverRect.width;
                }
                break;
            case 'right':
                top = targetMidY - popoverRect.height / 2;
                left = newTargetRect.right + padding;
                if (align === 'start') {
                    top = newTargetRect.top;
                }
                if (align === 'end') {
                    top = newTargetRect.bottom - popoverRect.height;
                }
                break;
            default:
                break;
        }
        return { top: top, left: left };
    };
    Popover.prototype.createContainer = function () {
        var _a = this.props, containerStyle = _a.containerStyle, containerClassName = _a.containerClassName;
        var container = window.document.createElement('div');
        container.style.overflow = 'hidden';
        if (containerStyle) {
            Object.keys(containerStyle).forEach(function (key) {
                return (container.style[key] = containerStyle[key]);
            });
        }
        container.className = containerClassName;
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        return container;
    };
    Popover.prototype.updatePopover = function (isOpen) {
        if (isOpen && this.targetRef) {
            if (!this.popoverDiv || !this.popoverDiv.parentNode) {
                var transitionDuration = this.props.transitionDuration;
                this.popoverDiv = this.createContainer();
                this.popoverDiv.style.opacity = '0';
                this.popoverDiv.style.transition = "opacity " + transitionDuration + "s";
            }
            window.addEventListener('resize', this.onResize);
            window.addEventListener('click', this.onClick);
            this.renderPopover();
        }
        else {
            this.removePopover();
        }
    };
    Popover.prototype.startTargetPositionListener = function (checkInterval) {
        var _this = this;
        if (!this.targetPositionIntervalHandler) {
            this.targetPositionIntervalHandler = window.setInterval(function () {
                var newTargetRect = _this.targetRef.current.getBoundingClientRect();
                if (util_1.targetPositionHasChanged(_this.targetRect, newTargetRect)) {
                    _this.renderPopover();
                }
                _this.targetRect = newTargetRect;
                if (_this.willUnmount || !_this.props.isOpen || !_this.popoverDiv.parentNode) {
                    _this.removePopover();
                }
            }, checkInterval);
        }
    };
    Popover.prototype.removePopover = function () {
        var _this = this;
        // this should now be a callback to handle event listening upon portal disappearance
        var _a = this.props, transitionDuration = _a.transitionDuration, isOpen = _a.isOpen;
        if (this.popoverDiv) {
            this.popoverDiv.style.opacity = '0';
        }
        var remove = function () {
            if (_this.willUnmount || !isOpen || !_this.popoverDiv.parentNode) {
                window.clearInterval(_this.targetPositionIntervalHandler);
                window.removeEventListener('resize', _this.onResize);
                window.removeEventListener('click', _this.onClick);
                _this.targetPositionIntervalHandler = undefined;
                _this.setState({ isTransitioningToClosed: false });
            }
        };
        if (!this.willUnmount) {
            this.removePopoverTimeout = window.setTimeout(remove, (transitionDuration || util_1.Constants.FADE_TRANSITION) * 1000);
        }
        else {
            remove();
        }
    };
    Popover.prototype.renderPopover = function (positionIndex) {
        var _this = this;
        if (positionIndex === void 0) { positionIndex = 0; }
        if (positionIndex >= this.positionOrder.length) {
            return;
        }
        this.renderWithPosition({
            position: this.positionOrder[positionIndex],
            targetRect: this.targetRef.current.getBoundingClientRect(),
        }, function (violation, rect) {
            var _a;
            var _b = _this.props, disableReposition = _b.disableReposition, contentLocation = _b.contentLocation, contentDestination = _b.contentDestination;
            if (violation && !disableReposition && !(typeof contentLocation === 'object')) {
                _this.renderPopover(positionIndex + 1);
            }
            else {
                var _c = _this.props, contentLocation_1 = _c.contentLocation, align = _c.align;
                var _d = _this.getNudgedPopoverPosition(rect), nudgedTop = _d.top, nudgedLeft = _d.left;
                var rectTop = rect.top, rectLeft = rect.left;
                var position = _this.positionOrder[positionIndex];
                var _e = disableReposition
                    ? { top: rectTop, left: rectLeft }
                    : { top: nudgedTop, left: nudgedLeft }, top_1 = _e.top, left = _e.left;
                if (contentLocation_1) {
                    var targetRect = _this.targetRef.current.getBoundingClientRect();
                    var popoverRect = _this.popoverDiv.getBoundingClientRect();
                    (_a = typeof contentLocation_1 === 'function'
                        ? contentLocation_1({
                            targetRect: targetRect,
                            popoverRect: popoverRect,
                            position: position,
                            align: align,
                            nudgedLeft: nudgedLeft,
                            nudgedTop: nudgedTop,
                        })
                        : contentLocation_1, top_1 = _a.top, left = _a.left);
                    _this.popoverDiv.style.left = left.toFixed() + "px";
                    _this.popoverDiv.style.top = top_1.toFixed() + "px";
                }
                else {
                    var destinationTopOffset = 0;
                    var destinationLeftOffset = 0;
                    if (contentDestination) {
                        var destRect = contentDestination.getBoundingClientRect();
                        destinationTopOffset = -destRect.top;
                        destinationLeftOffset = -destRect.left;
                    }
                    var absoluteTop = top_1 + window.pageYOffset;
                    var absoluteLeft = left + window.pageXOffset;
                    var finalLeft = absoluteLeft + destinationTopOffset;
                    var finalTop = absoluteTop + destinationLeftOffset;
                    _this.popoverDiv.style.left = finalLeft.toFixed() + "px";
                    _this.popoverDiv.style.top = finalTop.toFixed() + "px";
                }
                _this.popoverDiv.style.width = undefined;
                _this.popoverDiv.style.height = undefined;
                _this.renderWithPosition({
                    position: position,
                    nudgedTop: nudgedTop - rect.top,
                    nudgedLeft: nudgedLeft - rect.left,
                    targetRect: _this.targetRef.current.getBoundingClientRect(),
                    popoverRect: _this.popoverDiv.getBoundingClientRect(),
                }, function () {
                    _this.startTargetPositionListener(10);
                    if (_this.popoverDiv.style.opacity !== '1' && !_this.state.isTransitioningToClosed) {
                        _this.popoverDiv.style.opacity = '1';
                    }
                });
            }
        });
    };
    Popover.prototype.renderPopoverContent = function () {
        var _a = this.props, content = _a.content, isOpen = _a.isOpen, contentDestination = _a.contentDestination;
        var _b = this.state, popoverInfo = _b.popoverInfo, isTransitioningToClosed = _b.isTransitioningToClosed;
        if ((isOpen || isTransitioningToClosed) && this.popoverDiv && popoverInfo) {
            var getContent = function (args) {
                return typeof content === 'function' ? content(args) : content;
            };
            return (react_1.default.createElement(PopoverPortal_1.PopoverPortal, { element: this.popoverDiv, container: contentDestination || window.document.body }, getContent(popoverInfo)));
        }
        return null;
    };
    Popover.prototype.renderChildContent = function () {
        var children = this.props.children;
        return typeof children === 'function'
            ? children(this.targetRef)
            : react_1.default.cloneElement(children, {
                ref: this.targetRef,
            });
    };
    Popover.prototype.renderWithPosition = function (_a, callback) {
        var _this = this;
        var position = _a.position, _b = _a.nudgedLeft, nudgedLeft = _b === void 0 ? 0 : _b, _c = _a.nudgedTop, nudgedTop = _c === void 0 ? 0 : _c, _d = _a.targetRect, targetRect = _d === void 0 ? util_1.Constants.EMPTY_CLIENT_RECT : _d, _e = _a.popoverRect, popoverRect = _e === void 0 ? util_1.Constants.EMPTY_CLIENT_RECT : _e;
        var _f = this.props, padding = _f.windowBorderPadding, align = _f.align;
        var popoverInfo = { position: position, nudgedLeft: nudgedLeft, nudgedTop: nudgedTop, targetRect: targetRect, popoverRect: popoverRect, align: align };
        if (!util_1.popoverInfosAreEqual(this.state.popoverInfo, popoverInfo)) {
            window.clearTimeout(this.removePopoverTimeout);
            this.setState({ popoverInfo: popoverInfo, isTransitioningToClosed: false, internalisOpen: true }, function () {
                if (_this.willUnmount) {
                    return;
                }
                targetRect = _this.targetRef.current.getBoundingClientRect();
                popoverRect = _this.popoverDiv.getBoundingClientRect();
                var _a = _this.getLocationForPosition(position, targetRect, popoverRect), top = _a.top, left = _a.left;
                callback((position === 'top' && top < padding) ||
                    (position === 'left' && left < padding) ||
                    (position === 'right' && left + popoverRect.width > window.innerWidth - padding) ||
                    (position === 'bottom' && top + popoverRect.height > window.innerHeight - padding), { width: popoverRect.width, height: popoverRect.height, top: top, left: left });
            });
        }
    };
    Popover.prototype.render = function () {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            this.renderChildContent(),
            this.renderPopoverContent()));
    };
    Popover.defaultProps = {
        padding: util_1.Constants.DEFAULT_PADDING,
        windowBorderPadding: util_1.Constants.DEFAULT_WINDOW_PADDING,
        position: DEFAULT_POSITION_ORDER,
        align: 'center',
        containerClassName: util_1.Constants.POPOVER_CONTAINER_CLASS_NAME,
        transitionDuration: util_1.Constants.FADE_TRANSITION,
    };
    return Popover;
}(react_1.default.Component));
exports.default = Popover;
