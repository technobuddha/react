namespace Widget.AudioChannelEditor
{
	interface Visualization
	{
		min?:		number;
		max?:		number;
		x?:			number;
		y?:			number;
	}

	export interface Options	extends Widget.Undoable.Options
	{
		colorInactiveTop?:								string;		// colors when the mouse is outside of the editor box // color states (gradient from top to bottom)
		colorInactiveBottom?:							string;
		colorActiveTop?:								string;		// colors when the mouse is inside of the editor box
		colorActiveBottom?:								string;
		colorMouseDownTop?:								string;		// color when the mouse is pressed during inside of the editor box
		colorMouseDownBottom?:							string;
		colorSelectionStroke?:							string;		// color of the selection frame
		colorSelectionFill?:							string;
		colorWaveform?:									string;
		colorCenterline?:								string;
	}

	export interface Widget		extends Widget.Undoable.Widget
	{
		options:																										Options;
		defaultElement:																									string;

		title:																											string;
		audioLayerControl:																								any;
		canvas:																											HTMLCanvasElement;
		audioChannel:																									AudioChannel;
		clipboard:																										AudioChannel;
		canvasHeight:																									number;
		canvasWidth:																									number;
		name:																											string;
		mouseInside:																									boolean;			// is the mouse inside of the editor (for background coloring)
		mouseDown:																										boolean;			// state of the mouse button
		mouseInSelection:																								boolean;			// is the mouse clicked inside of the selection
		mouseAtSelectionStart:																							boolean;			// is the start or end bar selected
		mouseAtSelectionEnd:																							boolean;
		mouseX:																											number;				// current and previous position of the mouse
		mouseY:																											number;
		previousMouseX:																									number;
		previousMouseY:																									number;
		selectionStart:																									number;				// position of the selection (if equal, the selection is disabled)
		selectionEnd:																									number;
		visualizationData:																								Visualization[];	// temporary optimized visualization data
		hasFocus:																										boolean;			// handle focus for copy, paste & cut
		linkedEditors:																									Widget[];			// a list of editors which are linked to this one
		movePos:																										number;				// movement
		movementActive:																									boolean;
		viewZoom:																										number;				// zoom
		viewPos:																										number;
		plotTechnique:																									number;
		isZoomed:																										boolean;

		_onMouseover(event: JQueryMouseEventObject):																	void;
		_onMouseout(event: JQueryMouseEventObject):																		void;
		_onMousemove(event: JQueryMouseEventObject):																	void;
		_onMousedown(event: JQueryMouseEventObject):																	void;
		_onMouseup(event: JQueryMouseEventObject):																		void;
		_onDblclick(event: JQueryMouseEventObject):																		void;
		_updateLinkedEditors():																							void;
		_getSelectedZone():																								{ start: number, end: number };
		_getDecibel(signalValue: number, signalMaximum: number):														number;
		_getQuantity(decibel: number):																					number;
		_updateVisualizationData():																						void;
		_repaint():																										void;
		_paintEmpty(context: CanvasRenderingContext2D):																	void;
		_paintTextWidthShadow(text: string, x: number, y: number, style: string, context: CanvasRenderingContext2D):	void;
		_selectionChanged():																							void;

		pixelToOffset(pixelValue: number):																				number;
		offsetToPixel(offsetValue: number):																				number;
		offsetToSeconds(absoluteValue: number):																			number;
		secondsToOffset(seconds: number):																				number;
		link(otherEditor: Widget):																						void;
		setAudioChannel(audioChannel: AudioChannel):																	void;
		zoomToSelection():																								void;
		zoomToFit():																									number;
		selectAll():																									void;
		selectNone():																									void;
		cut():																											void;
		copy():																											void;
		paste():																										void;
		del():																											void;
		crop():																											void;
		filterNormalize():																								void;
		filterSilence():																								void;
		filterFade(fadeIn: boolean):																					void;
		filterGain(decibel: number):																					void;
	}

	$.widget
	(	'eliza.audioChannelEditor',
		$.eliza.undoable,
		<Widget>
		{
			//#region options
			options:
			<Options>
			{
				colorInactiveTop:			'#c5dbec',						//state-default-border			//'#D7E5C7',
				colorInactiveBottom:		'#dfeffc',						//state-default-background,		//'#D7E5C7',
				colorActiveTop:				'#79b7e7',						//state-focus-border			// '#EEE',
				colorActiveBottom:			'#d0e5f5',						//state-focus-background		// '#CCC',
				colorMouseDownTop:			'#79b7e7',						//state-focus-border			// '#EEE',
				colorMouseDownBottom:		'#d0e5f5',						//state-focus-background		// '#CCC',
				colorSelectionStroke:		'rgba(250, 212, 46, 0.57)',		//state-highlight-border		//'rgba(255, 0, 0, 0.5)',
				colorSelectionFill:			'rgba(251, 236, 136, 0.51)',	//state-highlight-background	//'rgba(255, 0, 0, 0.2)',
				colorWaveform:				'#2e6e9e',						//state-default-color			// "rgba(0, 0,0,0.5)";
				colorCenterline:			'#FFFFFF',

			},
			//#endregion
			//#region _create
			defaultElement:						'<div>',
			_create:							function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				widget._super();

				widget.audioLayerControl			= null;
				widget.canvas						= null;
				widget.audioChannel					= null;
				widget.clipboard					= null;
				widget.canvasHeight					= 100;
				widget.canvasWidth					= 800;
				widget.name							= String.empty;
				widget.mouseInside					= false;
				widget.mouseDown					= false;
				widget.mouseInSelection				= false;
				widget.mouseAtSelectionStart		= false;
				widget.mouseAtSelectionEnd			= false;
				widget.mouseX						= 0;
				widget.mouseY						= 0;
				widget.previousMouseX				= 0;
				widget.previousMouseY				= 0;
				widget.visualizationData			= [];
				widget.hasFocus						= false;
				widget.linkedEditors				= [];
				widget.movePos						= 0;
				widget.movementActive				= false;
				widget.selectionStart				= 0;
				widget.selectionEnd					= 0;
				widget.viewZoom						= 1;
				widget.viewPos						= 0;
				widget.isZoomed						= false;

				element
				.addClass('audioChannelEditor')
				.append
				(	$('<canvas class="audioLayerEditor">')
					.attr('width',	widget.canvasWidth)
					.attr('height',	widget.canvasHeight)
					.on('mouseover',	(event) => widget._onMouseover(event))
					.on('mouseout',		(event) => widget._onMouseout(event))
					.on('mousemove',	(event) => widget._onMousemove(event))
					.on('mousedown',	(event) => widget._onMousedown(event))
					.on('mouseup',		(event) => widget._onMouseup(event))
					.on('dblclick',		(event) => widget._onDblclick(event))
				)
				;

				widget.canvas	= element.children('canvas').get(0) as HTMLCanvasElement;
				widget._repaint();
			},
			//#endregion
			//#region override(undoable) _getStateValue
			_getStateValue:				$.noop,
			//#endregion
			//#region override(undoable) _getStateSelect
			_getStateSelect:			$.noop,
			//#endregion
			//#region override(undoable) _setStateValue
			_setStateValue:				$.noop,
			//#endregion
			//#region override(undoable) _setStateSelect
			_setStateSelect:			$.noop,
			//#endregion
			//#region _onMouseover
			_onMouseover:					function(event)
			{
				let widget	= <Widget>this;

				widget.mouseInside	= true;
				widget._repaint();
			},
			//#endregion
			//#region _onMouseout
			_onMouseout:					function(event)
			{
				let widget	= <Widget>this;

				if(widget.selectionStart > widget.selectionEnd)
				{
					let temp					= widget.selectionStart;
					widget.selectionStart		= widget.selectionEnd;
					widget.selectionEnd			= temp;
				}

				widget.mouseInSelection			= false;
				widget.mouseAtSelectionStart	= false;
				widget.mouseAtSelectionEnd		= false;
				widget.mouseDown				= false;
				widget.mouseInside				= false;

				widget._repaint();
				widget._updateLinkedEditors();
			},
			//#endregion
			//#region _onMousemove
			_onMousemove:					function(event)
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				widget.previousMouseX	= widget.mouseX;
				widget.previousMouseY	= widget.mouseY;
				widget.mouseX			= event.clientX - element.offset().left;
				widget.mouseY			= event.clientY - element.offset().top;

				let mouseXDelta			= widget.mouseX - widget.previousMouseX;
				if(widget.mouseDown)
				{
					if(widget.movementActive)
					{
						let movementResolution	 = widget.viewZoom / widget.canvasWidth;
						widget.viewPos			-= mouseXDelta * movementResolution;
						widget.selectionStart	-= mouseXDelta * movementResolution;
						widget.selectionEnd		-= mouseXDelta * movementResolution;
					}
					else
					{
						if(widget.mouseInSelection)
						{
							let absDelta	= widget.pixelToOffset(widget.mouseX) - widget.pixelToOffset(widget.previousMouseX);
							widget.selectionStart	+= absDelta;
							widget.selectionEnd		+= absDelta;
						}
						else
						if(widget.mouseAtSelectionStart)
						{
							widget.selectionStart	= widget.pixelToOffset(widget.mouseX);
						}
						else
						{
							widget.selectionEnd		= widget.pixelToOffset(widget.mouseX);
						}
					}
					widget._selectionChanged();
				}

				widget._repaint();
				widget._updateLinkedEditors();
			},
			//#endregion
			//#region _onMousedown
			_onMousedown:				function(event)
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				widget.mouseDown	= true;

				if(!widget.movementActive)
				{
					let selectionStartPixel	= widget.offsetToPixel(widget.selectionStart);
					let selectionEndPixel	= widget.offsetToPixel(widget.selectionEnd);

					// is the mouse inside of the selection right now
					if(widget.mouseX - 5 > selectionStartPixel && widget.mouseX + 5 < selectionEndPixel)
					{
						widget.mouseInSelection = true;
					}
					else
					// is the mouse on the left bar of the selection
					if(widget.mouseX - 5 < selectionStartPixel && widget.mouseX + 5 > selectionStartPixel)
					{
						widget.mouseAtSelectionStart = true;
					}
					else
					// is the mouse on the right bar of the selection
					if(widget.mouseX - 5 < selectionEndPixel && widget.mouseX + 5 > selectionEndPixel)
					{
						widget.mouseAtSelectionEnd = true;
					}
					else
					// if the mouse is somewhere else, start a new selection
					{
						widget.selectionStart	= widget.pixelToOffset(widget.mouseX);
						widget.selectionEnd		= widget.selectionStart;
						widget._selectionChanged();
					}
				}

				// get the focus on this editor
				//focusOnAudioLayerSequenceEditor = widget;
				widget._repaint();
				widget._updateLinkedEditors();
			},
			//#endregion
			//#region _onMouseup
			_onMouseup:						function(event)
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				// swap the selection position if start is bigger then end
				if(widget.selectionStart > widget.selectionEnd)
				{
					let temp				= widget.selectionStart;
					widget.selectionStart	= widget.selectionEnd;
					widget.selectionEnd		= temp;
				}

				// reset the selction mouse states for the selection
				widget.mouseInSelection			= false;
				widget.mouseAtSelectionStart	= false;
				widget.mouseAtSelectionEnd		= false;
				widget.mouseDown				= false;
				widget._repaint();
				widget._updateLinkedEditors();
			},
			//#endregion
			//#region _onDblclick
			_onDblclick:					function(event)
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				// deselect on double click
				if(widget.selectionStart != widget.selectionEnd)
				{
					widget.selectionStart	= 0;
					widget.selectionEnd		= 0;
				}
				else
				{
					widget.selectionStart	= 0;
					widget.selectionEnd		= widget.pixelToOffset(widget.canvasWidth);
				}
				widget._selectionChanged();

				widget.mouseDown				= false;
				widget.mouseAtSelectionStart	= false;
				widget.mouseAtSelectionEnd		= false;
				widget.mouseInSelection			= false;
				widget._repaint();
				widget._updateLinkedEditors();
			},
			//#endregion
			//#region _updateLinkedEditors
			_updateLinkedEditors:	function()
			{
				let widget	= <Widget>this;

				for(let i = 0; i < widget.linkedEditors.length; ++i)
				{
					let linkedEditor			= widget.linkedEditors[i];
					linkedEditor.selectionStart	= widget.selectionStart;
					linkedEditor.selectionEnd	= widget.selectionEnd;

					if(linkedEditor.viewPos !== widget.viewPos || linkedEditor.viewZoom !== widget.viewZoom || linkedEditor.isZoomed !== widget.isZoomed)
					{
						linkedEditor.viewPos	= widget.viewPos;
						linkedEditor.viewZoom	= widget.viewZoom;
						linkedEditor.isZoomed	= widget.isZoomed;
						linkedEditor._updateVisualizationData();
					}

					linkedEditor._repaint();
				}
			},
			//#endregion
			//#region _getSelectedZone
			_getSelectedZone:							function()
			{
				let widget	= <Widget>this;
				let start	= (widget.selectionStart < 0) ? 0 : (widget.selectionStart >= widget.audioChannel.data.length) ? widget.audioChannel.data.length - 1 : widget.selectionStart;
				let end		= (widget.selectionEnd < 0)   ? 0 : (widget.selectionEnd   >= widget.audioChannel.data.length) ? widget.audioChannel.data.length - 1 : widget.selectionEnd;

				return { start: start, end: end };;
			},
			//#endregion
			//#region _getDecibel
			_getDecibel:								function(signalValue, signalMaximum)
			{
				return 20.0 * Math.log(signalValue / signalMaximum) / Math.LN10;
			},
			//#endregion
			//#region _getQuantity
			_getQuantity:							function(decibel)
			{
				return Math.exp(decibel * Math.LN10 / 20.0);
			},
			//#endregion
			//#region _updateVisualizationData
			_updateVisualizationData:					function()
			{
				let widget	= <Widget>this;

				widget.visualizationData = [];
				let data	= widget.audioChannel.data;
				let offsetR = widget.audioChannel.sampleRate * widget.viewPos;

				// get the offset and length in samples
				let from	= Math.round(widget.viewPos  * widget.audioChannel.sampleRate);
				let len		= Math.round(widget.viewZoom * widget.audioChannel.sampleRate);

				// when the spot is to large
				if(len > widget.canvasWidth)
				{
					let dataPerPixel = len / widget.canvasWidth;
					for (let i = 0; i < widget.canvasWidth; ++i)
					{
						let dataFrom = i * dataPerPixel + offsetR;
						let dataTo	 = (i + 1) * dataPerPixel + offsetR + 1;

						if (dataFrom >= 0 && dataFrom < data.length && dataTo >= 0 && dataTo < data.length)
						{
							//#region get the minimum and maximum values for the frame
							let fromRounded	= Math.round(dataFrom);
							let toRounded	= Math.round(dataTo);
							let min			= 1.0;
							let max			= -1.0;

							for(let i = fromRounded; i < toRounded; ++i)
							{
								let sample	= data[i];

								max = (sample > max) ? sample : max;
								min = (sample < min) ? sample : min;
							}
							//#endregion

							widget.visualizationData.push({ min: min, max: max });
						}
						else
						{
							widget.visualizationData.push({ min: 0.0, max: 0.0 });
						}
					}
					widget.plotTechnique = 1;
				}
				else
				{
					let pixelPerData	= widget.canvasWidth / len;
					let x				= 0;

					for(let i = from; i <= from + len; ++i)
					{
						// if outside of the data range
						if(i < 0 || i >= data.length)
						{
							widget.visualizationData.push({ y: 0.0, x: x });
						}
						else
						{
							widget.visualizationData.push({ y: data[i], x: x });
						}
						x += pixelPerData;
					}
					widget.plotTechnique = 2;
				}

				// intial _repaint
				widget._repaint();
			},
			//#endregion
			//#region _repaint
			_repaint:								function()
			{
				let widget	= <Widget>this;
				let options	= widget.options;

				if(widget.canvas)
				{
					let context		= widget.canvas.getContext('2d');
					// clear the drawing area
					context.clearRect(0, 0, widget.canvasWidth, widget.canvasHeight);

					// draw background
					let gradient = context.createLinearGradient(0, 0, 0, widget.canvasHeight);
					gradient.addColorStop(0.0, (widget.mouseInside) ? (widget.mouseDown) ? options.colorMouseDownTop    : options.colorActiveTop    : options.colorInactiveTop);
					gradient.addColorStop(0.5, (widget.mouseInside) ? (widget.mouseDown) ? options.colorMouseDownBottom : options.colorActiveBottom : options.colorInactiveBottom);
					gradient.addColorStop(1.0, (widget.mouseInside) ? (widget.mouseDown) ? options.colorMouseDownTop    : options.colorActiveTop    : options.colorInactiveTop);
					context.fillStyle = gradient;
					context.fillRect(0, 0, widget.canvasWidth, widget.canvasHeight);

					// if no audio sequence is attached, nothing can be rendered
					if(widget.audioChannel)
					{
						//#region draw waveform
						let seq					= widget.audioChannel;
						let center				= widget.canvasHeight / 2;
						let verticalMultiplier	= (seq.gain < 1.0) ? 1.0 : 1.0 / seq.gain;		// if the signal is above the 0db border, then a vertical zoomout must be applied
						let data				= seq.data;										// for later use of sequencial context

						context.strokeStyle	= options.colorWaveform;
						context.beginPath();
						context.moveTo(0, center);

						// choose the drawing style of the waveform
						if(widget.plotTechnique == 1)
						{
							// data per pixel
							for(let i = 0; i < widget.canvasWidth; ++i)
							{
								let peakAtFrame = widget.visualizationData[i];
								context.moveTo(i + 0.5, center + peakAtFrame.min * verticalMultiplier * -center);
								context.lineTo(i + 0.5, (center + peakAtFrame.max * verticalMultiplier * -center) + 1.0);
							}
						}
						else
						if(widget.plotTechnique == 2)
						{
							let s	= 1;

							for(let i = 0; i < widget.visualizationData.length; ++i)
							{
								let x	= widget.visualizationData[i].x;
								let y	= center + widget.visualizationData[i].y * verticalMultiplier * -center;

								context.lineTo(x, y);

								// draw edges around each data point
								context.moveTo(x + s, y - s);
								context.lineTo(x + s, y + s);
								context.moveTo(x - s, y - s);
								context.lineTo(x - s, y + s);
								context.moveTo(x - s, y + s);
								context.lineTo(x + s, y + s);
								context.moveTo(x - s, y - s);
								context.lineTo(x + s, y - s);

								context.moveTo(x, y);
							}
						}

						context.stroke();

						// draw the horizontal center line
						context.strokeStyle = options.colorCenterline;
						context.beginPath();
						context.moveTo(0, center);
						context.lineTo(widget.canvasWidth, center);
						context.stroke();
						//#endregion
						//#region  draw the selector rectangle
						let selectionStartPixel	= widget.offsetToPixel(widget.selectionStart);
						let selectionEndPixel	= widget.offsetToPixel(widget.selectionEnd);

						if(widget.selectionStart !== widget.selectionEnd)
						{
							let start	= (selectionStartPixel < selectionEndPixel) ? selectionStartPixel : selectionEndPixel;
							let width	= (selectionStartPixel < selectionEndPixel) ? selectionEndPixel - selectionStartPixel : selectionStartPixel - selectionEndPixel;

							context.fillStyle = options.colorSelectionFill;
							context.fillRect(start, 0, width, widget.canvasHeight);

							context.strokeStyle = options.colorSelectionStroke;
							context.strokeRect(start, 0, width, widget.canvasHeight);
						}
						else
						{
							context.strokeStyle = options.colorSelectionStroke;
							context.beginPath();
							context.moveTo(selectionStartPixel, 0);
							context.lineTo(selectionStartPixel, widget.canvasHeight);
							context.stroke();
						}
						//#endregion
					}
					else
					{
						widget._paintEmpty(context);
					}
				}
			},
			//#endregion
			//#region _paintEmpty
			_paintEmpty:								function(canvasContext)
			{
				let widget	= <Widget>this;

				let oldFont					= canvasContext.font;
				let oldTextAlign			= canvasContext.textAlign;
				let oldBaseline				= canvasContext.textBaseline;

				canvasContext.font			= 'italic 40px Calibri';
				canvasContext.textAlign		= 'center';
				canvasContext.textBaseline	= "middle"
				widget._paintTextWidthShadow("Drag audio file here to edit", canvasContext.canvas.clientWidth / 2.0, canvasContext.canvas.clientHeight / 2.0, "rgba(0,0,0,1)", canvasContext);

				canvasContext.font			= oldFont;
				canvasContext.textAlign		= 'left';
				canvasContext.textBaseline	= 'top';
			},
			//#endregion
			//#region _paintTextWidthShadow
			_paintTextWidthShadow:					function(text, x, y, style, canvasContext)
			{
				canvasContext.fillStyle = "rgba(0,0,0,0.25)";
				canvasContext.fillText(text,x + 1, y + 1);

				canvasContext.fillStyle = style;
				canvasContext.fillText(text,x, y);
			},
			//#endregion
			//#region _selectionChanged
			_selectionChanged:				function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				element.trigger
				(	'selectionChanged',
					{
						isSelected:		widget.selectionStart !== widget.selectionEnd,
						isZoomed:		widget.isZoomed,
						canPaste:		!!widget.clipboard,
						allSelected:	widget.selectionStart === widget.secondsToOffset(widget.viewPos) &&
										widget.selectionEnd === widget.secondsToOffset(widget.viewPos + widget.viewZoom)
					}
				);
			},
			//#endregion
			//#region pixelToOffset
			pixelToOffset:							function(pixelValue)
			{
				let widget	= <Widget>this;

				if(!widget.audioChannel) return 0;

				let samplesInView	= widget.viewZoom * widget.audioChannel.sampleRate;
				let viewOffset		= widget.viewPos  * widget.audioChannel.sampleRate;

				return Math.round(samplesInView / widget.canvasWidth * pixelValue + viewOffset);
			},
			//#endregion
			//#region offsetToPixel
			offsetToPixel:							function(offsetValue)
			{
				let widget	= <Widget>this;
				if(!widget.audioChannel) return 0;

				let samplesInView	= widget.viewZoom * widget.audioChannel.sampleRate;
				let viewOffset		= widget.viewPos  * widget.audioChannel.sampleRate;

				return (offsetValue - viewOffset) / samplesInView * widget.canvasWidth;
			},
			//#endregion
			//#region offsetToSeconds
			offsetToSeconds:							function(offsetValue)
			{
				let widget	= <Widget>this;

				if(!widget.audioChannel) return 0;

				return offsetValue / widget.audioChannel.sampleRate;
			},
			//#endregion
			//#region secondsToOffset
			secondsToOffset:							function(seconds)
			{
				let widget	= <Widget>this;

				if(!widget.audioChannel) return 0;

				return Math.round(seconds * widget.audioChannel.sampleRate);
			},
			//#endregion
			//#region link
			link:								function(otherEditor)
			{
				let widget	= <Widget>this;

				for(let i = 0; i < widget.linkedEditors.length; ++i)
				{
					if(widget.linkedEditors[i] === otherEditor) return;
				}

				widget.linkedEditors.push(otherEditor);
				otherEditor.link(this);
			},
			//#endregion
			//#region setAudioChannel
			setAudioChannel:							function(audioChannel)
			{
				let widget	= <Widget>this;

				widget.audioChannel	= audioChannel;
				widget._updateVisualizationData();
			},
			//#endregion
			//#region zoomToSelection
			zoomToSelection:							function()
			{
				let widget	= <Widget>this;

				widget.isZoomed	= true;
				widget.viewZoom	= widget.offsetToSeconds(widget.selectionEnd - widget.selectionStart);
				widget.viewPos	= widget.offsetToSeconds(widget.selectionStart);

				widget._updateVisualizationData();
				widget._repaint();
				widget._selectionChanged();
			},
			//#endregion
			//#region zoomToFit
			zoomToFit:									function()
			{
				let widget	= <Widget>this;

				widget.isZoomed	= false;
				widget.viewPos	= 0;
				widget.viewZoom	= widget.offsetToSeconds(widget.audioChannel.data.length);

				widget._updateVisualizationData();
				widget._repaint();
				widget._selectionChanged();
			},
			//#endregion
			//#region selectAll
			selectAll:								function(processLinks)
			{
				let widget	= <Widget>this;

				widget.selectionStart	= widget.secondsToOffset(widget.viewPos);
				widget.selectionEnd		= widget.secondsToOffset(widget.viewPos + widget.viewZoom);
				widget._repaint();
				widget._selectionChanged();
			},
			//#endregion
			//#region selectNone
			selectNone:								function(processLinks)
			{
				let widget	= <Widget>this;

				widget.selectionStart	= 0;
				widget.selectionEnd		= 0;
				widget._repaint();
				widget._selectionChanged();
			},
			//#endregion
			//#region cut
			cut:								function()
			{
				let widget	= <Widget>this;
				let { start: start, end: end }	= widget._getSelectedZone();

				widget.clipboard = widget.audioChannel.clone(start, end - start);
				widget.del();
			},
			//#endregion
			//#region copy
			copy:									function()
			{
				let widget	= <Widget>this;
				let { start: start, end: end }	= widget._getSelectedZone();

				widget.clipboard = widget.audioChannel.clone(start, end - start);
			},
			//#endregion
			//#region paste
			paste:									function paste()
			{
				let widget	= <Widget>this;

				if(widget.clipboard)
				{
					if(widget.selectionStart !== widget.selectionEnd)
						widget.del();

					// paste before the data block begins
					if(widget.selectionEnd < 0)
					{
						// fill the space with zeros
						widget.viewPos -= widget.offsetToSeconds(widget.selectionStart);
						widget.audioChannel.createZeroData(-widget.selectionEnd, 0);
						widget.audioChannel.merge(widget.clipboard, 0);
						widget.selectionStart = 0;
						widget.selectionEnd = widget.clipboard.data.length;
					}
					else
					// paste beyond the data block
					if(widget.selectionStart > widget.audioChannel.data.length)
					{
						widget.audioChannel.createZeroData(widget.selectionStart - widget.audioChannel.data.length);
						widget.audioChannel.merge(widget.clipboard);
						widget.selectionEnd = widget.selectionStart + widget.clipboard.data.length;
					}
					// paste inside of the datablock
					else
					{
						widget.audioChannel.merge(widget.clipboard, widget.selectionStart);
						widget.selectionStart = widget.selectionStart;
						widget.selectionEnd = widget.selectionStart + widget.clipboard.data.length;
					}

					widget.zoomToFit();
				}
			},
			//#endregion
			//#region del
			del:								function()
			{
				let widget	= <Widget>this;
				let { start: start, end: end }	= widget._getSelectedZone();

				widget.audioChannel.remove(start, end - start);
				widget.selectionEnd		= widget.selectionStart;
				widget.zoomToFit();
			},
			//#endregion
			//#region crop
			crop:								function()
			{
				let widget	= <Widget>this;
				let { start: start, end: end }	= widget._getSelectedZone();

				widget.audioChannel.remove(end, widget.audioChannel.data.length - end);
				widget.audioChannel.remove(0,	 start);

				widget.selectAll();
				widget.zoomToFit();
			},
			//#endregion
			//#region filterNormalize
			filterNormalize:						function()
			{
				let widget						= <Widget>this;
				let { start: start, end: end }	= widget._getSelectedZone();

				if(start == end)
					widget.audioChannel.filterNormalize();
				else
					widget.audioChannel.filterNormalize(start, end - start);

				widget._updateVisualizationData();
				widget._repaint();
			},
			//#endregion
			//#region filterSilence
			filterSilence:							function filterSilence()
			{
				let widget						= <Widget>this;
				let { start: start, end: end }	= widget._getSelectedZone();

				if(start == end)
					widget.audioChannel.filterSilence();
				else
					widget.audioChannel.filterSilence(start, end - start);

				widget._updateVisualizationData();
				widget._repaint();
			},
			//#endregion
			//#region filterFade
			filterFade:							function(fadeIn)
			{
				let widget						= <Widget>this;
				let { start: start, end: end }	= widget._getSelectedZone();

				if(start === end)
					widget.audioChannel.filterLinearFade((fadeIn === true) ? 0.0 : 1.0, (fadeIn === true) ? 1.0 : 0.0);
				else
					widget.audioChannel.filterLinearFade((fadeIn === true) ? 0.0 : 1.0, (fadeIn === true) ? 1.0 : 0.0, start, end - start);

				widget._updateVisualizationData();
				widget._repaint();
			},
			//#endregion
			//#region filterGain
			filterGain:								function(decibel)
			{
				let widget	= <Widget>this;
				let { start: start, end: end }	= widget._getSelectedZone();

				if(start === end)
					widget.audioChannel.filterGain(widget._getQuantity(decibel));
				else
					widget.audioChannel.filterGain(widget._getQuantity(decibel), start, end - start);

				widget._updateVisualizationData();
				widget._repaint();
			},
			//#endregion
		}
	);
}

interface JQueryElizaNamespace
{
	audioChannelEditor(options?: Widget.AudioChannelEditor.Options, element?: JQuery): Widget.AudioChannelEditor.Widget;
}

interface JQuery
{
	audioChannelEditor(...args: any[]): any;
}