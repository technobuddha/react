namespace Widget.AudioEditor
{
	import Automatic = Widget.Undoable.Automatic;

	//#region Options
	export interface Options		extends Widget.Undoable.Options
	{
		tags?:							StringDictionary<string>;
		name?:							string;
		dirty?:							boolean;
	}
	//#endregion
	//#region Widget
	export interface Widget		extends Widget.Undoable.Widget
	{
		options:																										Options;
		defaultElement:																									string;

		title:																											string;
		audioChannelEditors:																							Widget.AudioChannelEditor.Widget[];
		playLoop:																										boolean;
		timelineContext:																								CanvasRenderingContext2D;
		sampleRate:																										number;
		originalSampleRate:																								number;
		originalBitsPerSample:																							number;
		originalTags:																									StringDictionary<string>;
		length:																											number;
		duration:																										number;
		numChannels:																									number;
		gainLevel:																										number;

		_onAudioPlayback(currentPlayPosition: number):																	void;
		_onAudioAnalysis(analyser: AnalyserNode):																		void;
		_onFileChange(event: JQueryEventObject):																		void;
		_fileLoaded(result: ArrayBuffer):																				JQueryPromise<void>;
		_createAuduoChannelEditor(name: string):																		Widget.AudioChannelEditor.Widget;
		_removeAllAudioChannelEditors():																				void;
		_saveAs():																										void;
		_open():																										void;
		_toWave():																										Wave;
		_selectionChanged(info: { isSelected: boolean, isZoomed: boolean, canPaste: boolean, allSelected: boolean }):	void;

		zoomToSelection():																								void;
		zoomToFit():																									void;
		selectAll():																									void;
		selectNone():																									void;
		filterNormalize():																								void;
		filterFadeIn():																									void;
		filterFadeOut():																								void;
		filterGain(decibel: number):																					void;
		filterSilence():																								void;
		copy():																											void;
		paste():																										void;
		cut():																											void;
		crop():																											void;
		del():																											void;
		playToggle():																									void;
		play():																											void;
		stop():																											void;
		toggleLoop():																									void;

		setValue(value: ArrayBuffer):																					JQueryPromise<void>;
		getValue():																										ArrayBuffer;
		_inited: boolean;
	}
	//#endregion

	$.widget
	(	'eliza.audioEditor',
		$.eliza.undoable,
		<Widget>
		{
			//#region options
			options:
			<Options>
			{
				tags:			{},
				dirty:			false,
			},
			//#endregion
			//#region _create
			defaultElement:						'<div>',
			_create:							function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				widget._super();
				widget.title					= "untitled";
				widget.audioChannelEditors		= [];
				widget.playLoop					= false;
				widget.gainLevel				= 0;

				element
				.addClass('audioEditor')
				.append
				(	$('<canvas class="audio-spectrum">'),
					$('<div class="audio-editor">')
					.append
					(	$('<div class="editControls">')
						.append
						(	$('<div>')
							.append
							(	$('<button class="loaded select">').button( { label: 'Zoom in',		icons: { primary: 'ui-icon-zoomin'			} }).on('click', () => widget.zoomToSelection()),
								$('<button class="loaded zoomed">').button( { label: 'Zoom out',	icons: { primary: 'ui-icon-zoomin'			} }).on('click', () => widget.zoomToFit()),
								$('<button class="loaded notall">').button( { label: 'Select',		icons: { primary: 'ui-icon-carat-2-e-w'		} }).on('click', () => widget.selectAll()),
								$('<button class="loaded select">').button( { label: 'Unselect',	icons: { primary: 'ui-icon-close'			} }).on('click', () => widget.selectNone())
							)
							.buttonset(),
							$('<div>')
							.append
							(	$('<button class="loaded select">').button( { label: 'Cut',			icons: { primary: 'ui-icon-scissors'		} }).on('click', () => widget.cut()),
								$('<button class="loaded select">').button( { label: 'Copy',		icons: { primary: 'ui-icon-copy'			} }).on('click', () => widget.copy()),
								$('<button class="loaded cliped">').button( { label: 'Paste',		icons: { primary: 'ui-icon-clipboard'		} }).on('click', () => widget.paste()),
								$('<button class="loaded select">').button( { label: 'Crop',		icons: { primary: 'ui-icon-transfer-e-w'	} }).on('click', () => widget.crop()),
								$('<button class="loaded select">').button( { label: 'Delete',		icons: { primary: 'ui-icon-trash'			} }).on('click', () => widget.del())
							)
							.buttonset()
						),
						$('<div class="display">')
						.fileDropbox
						(
							{
								loaded:		function(event: Event, result: ArrayBuffer)
								{
									widget.do();
									widget._fileLoaded(result)
									.done(() => element.trigger('update'));
								},
								multiple:	false,
								readAs:		'ArrayBuffer'
							}
						),
						$('<div class="playbackControls">')
						.append
						(	$('<input name="file" type="file" accept="audio/*"/>')
							.on('change', (event) => widget._onFileChange(event)),
							$('<div>')
							.append
							(	$('<button class="loaded playin">').button( { text: false,			icons: { primary: 'ui-icon-play'			} }).on('click', () => widget.play()),
								$('<button class="loaded playin">').button( { text: false,			icons: { primary: 'ui-icon-stop'			} }).on('click', () => widget.stop()),
								$('<button class="loaded playin">').button( { text: false,			icons: { primary: 'ui-icon-refresh		'	} }).on('click', () => widget.toggleLoop())
							)
							.buttonset(),
							$('<div>')
							.append
							(	$('<button class="loaded"      >').button( { label: 'Save as…',		icons: { primary: 'ui-icon-disk'			} }).on('click', () => widget._saveAs()),
								$('<button                     >').button( { label: 'Open…',		icons: { primary: 'ui-icon-folder-open'		} }).on('click', () => widget._open())
							)
							.buttonset(),
							$('<div>')
							.append
							(	$('<button class="loaded"      >').button( { label: 'Normalize',	icons: { primary: 'eliza-icon-filter'		} }).on('click', () => widget.filterNormalize()),
								$('<button class="loaded"      >').button( { label: 'Silence',		icons: { primary: 'eliza-icon-filter'		} }).on('click', () => widget.filterSilence()),
								$('<button class="loaded"      >').button( { label: 'Fade In',		icons: { primary: 'eliza-icon-filter'		} }).on('click', () => widget.filterFadeIn()),
								$('<button class="loaded"      >').button( { label: 'Fade Out',		icons: { primary: 'eliza-icon-filter'		} }).on('click', () => widget.filterFadeOut()),
								$('<button class="loaded"      >').button( { label: 'Gain 0db',		icons: { primary: 'ui-icon-minus', secondary: 'ui-icon-plus' } })
								.on
								(	'click',
									function(event)
									{
										let	target	= $(event.target);

										if(target.hasClass('ui-icon-minus'))
										{
											widget.gainLevel--;
											target.parent().find('.ui-button-text').text(`Gain ${widget.gainLevel}db`);
										}
										else
										if(target.hasClass('ui-icon-plus'))
										{
											widget.gainLevel++;
											target.parent().find('.ui-button-text').text(`Gain ${widget.gainLevel}db`);
										}
										else
											widget.filterGain(widget.gainLevel);
									}
								)
							)
							.buttonset()
						)
					)
				)
				.on('selectstart',	() => false)
				;
				element.on('update',
					function()
					{
						widget._setOption('dirty', true);
					});

				element.find('.ui-buttonset').buttonset('option', 'disabled', true);
				widget._inited = true;
			},
			//#endregion
			//#region override(undoable) _getStateValue
			_getStateValue:				function()
			{
				let widget	= <Widget>this;

		return	{
					originalSampleRate:		widget.originalSampleRate,
					originalBitsPerSample:	widget.originalBitsPerSample,
					originalTags:			widget.originalTags,
					sampleRate:				widget.sampleRate,
					duration:				widget.duration,
					numChannels:			widget.numChannels,
					length:					widget.length,
					channels:				_.map
											(	widget.audioChannelEditors,
												function(ace)
												{
											return	{
														audioChannel:		ace.audioChannel.clone(),
														start:				ace.selectionStart,
														end:				ace.selectionEnd,
														viewPos:			ace.viewPos,
														viewZoom:			ace.viewZoom
													}
												}
											)
				}
			},
			//#endregion
			//#region override(undoable) _getStateSelect
			_getStateSelect:			$.noop,
			//#endregion
			//#region override(undoable) _setStateValue
			_setStateValue:				function(value)
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				if(widget.numChannels !== value.numChannels)
				{
					widget._removeAllAudioChannelEditors();

					element.toggleClass('stereo', value.numChannels === 2);

					let channelNames = value.numChannels === 1 ? ["Mono"] : ["Left", "Right"];
					for(let i = 0; i < value.numChannels; ++i)
						widget._createAuduoChannelEditor(channelNames[i]);
				}

				widget.originalSampleRate		= value.originalSampleRate;
				widget.originalBitsPerSample	= value.originalBitsPerSample;
				widget.originalTags				= value.originalTags;
				widget.sampleRate				= value.sampleRate;
				widget.duration					= value.duration;
				widget.numChannels				= value.numChannels;
				widget.length					= value.length;

				_.each
				(	value.channels,
					function(channel, i)
					{
						widget.audioChannelEditors[i].audioChannel		= channel.audioChannel.clone();
						widget.audioChannelEditors[i].selectionStart	= channel.start;
						widget.audioChannelEditors[i].selectionEnd		= channel.end;
						widget.audioChannelEditors[i].viewPos			= channel.viewPos;
						widget.audioChannelEditors[i].viewZoom			= channel.viewZoom;

						widget.audioChannelEditors[i]._updateVisualizationData();
						widget.audioChannelEditors[i]._repaint();
						widget.audioChannelEditors[i]._selectionChanged();
					}
				);
			},
			//#endregion
			//#region override(undoable) _setStateSelect
			_setStateSelect:			$.noop,
			//#endregion
			//#region _onAudioPlayback
			_onAudioPlayback:					function(time)
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				if(_.isNil(time))
				{
					element.children('.audio-editor').children('.timeline').remove();
					widget.timelineContext	= null;
				}
				else
				{
					if(_.isNil(widget.timelineContext))
					{
						element.children('.audio-editor').append($('<canvas class="timeline">').attr('width', 800).attr('height', 100 * widget.numChannels));
						widget.timelineContext	= (element.children('.audio-editor').children('.timeline').get(0) as HTMLCanvasElement).getContext('2d');
					}

					let context	= widget.timelineContext;

					context.clearRect(0, 0, context.canvas.width, context.canvas.height);

					let ace		= widget.audioChannelEditors[0];
					let pixel	= ace.offsetToPixel(time);
					if(pixel > 0 && pixel < context.canvas.width)
					{
						context.strokeStyle = '#000';
						context.beginPath();
						context.moveTo(pixel, 0);
						context.lineTo(pixel, context.canvas.height);
						context.stroke();
					}
				}
			},
			//#endregion
			//#region _onAudioAnalysis
			_onAudioAnalysis:					function(analyser)
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				let context		= (element.find('.audio-spectrum').get(0) as HTMLCanvasElement).getContext('2d');
				let width		= context.canvas.width;
				let height		= context.canvas.height;

				context.fillStyle	= 'rgb(252, 253, 253)';
				context.fillRect(0, 0, width, height);

				if(analyser)
				{
					let bins		= analyser.frequencyBinCount;
					let dataArray	= new Uint8Array(bins);
					analyser.getByteFrequencyData(dataArray);


					let barWidth	= (width - bins) / bins;
					let x			= 0;

					for(let i = 0; i < bins; i++)
					{
						let barHeight	= height * dataArray[i] / 256;

						context.fillStyle	= `rgb(${dataArray[i]}, 64, 128)`;
						context.fillRect(x, height - barHeight, barWidth, barHeight);

						x += barWidth + 1;
					}
				}
			},
			//#endregion
			//#region _onFileChange
			_onFileChange:							function(event)
			{
				let widget	= <Widget>this;
				let element	= widget.element;
				let files	= $(event.target).prop('files') as FileList;

				if(files.length > 0)
				{
					let file	= files[0];
					let reader	= new FileReader();
					reader.onload	= function(event: Event)
					{
						widget.do();
						widget._fileLoaded((event.target as FileReader).result);
						element.trigger('update');
					};
					reader.readAsArrayBuffer(file);
				}
			},
			//#endregion
			//#region _fileLoaded
			_fileLoaded:						function(result)
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				return $.Deferred<void>(function(defer)
				{
					AudioPlayback.decodeAudioData
					(	result,
						function(audioBuffer: AudioBuffer)
						{
							widget._removeAllAudioChannelEditors();

							let	{ sampleRate: sampleRate, bitsPerSample: bitsPerSample } = Wave.fmt(result);
							widget.originalSampleRate		= sampleRate;
							widget.originalBitsPerSample	= bitsPerSample;
							widget.originalTags				= Wave.tags(result);
							widget.sampleRate				= audioBuffer.sampleRate;		// samples per second
							widget.duration					= audioBuffer.duration;			// in seconds
							widget.numChannels				= audioBuffer.numberOfChannels;	// number of channels
							widget.length					= audioBuffer.length;			// audio data in samples

							element.toggleClass('stereo', widget.numChannels === 2);

							let channelNames = widget.numChannels === 1 ? ["Mono"] : ["Left", "Right"];
							for(let i = 0; i < widget.numChannels; ++i)
							{
								let editor		= widget._createAuduoChannelEditor(channelNames[i]);
								editor.setAudioChannel(new AudioChannel(widget.sampleRate, audioBuffer.getChannelData(i)));
								editor.zoomToFit();
							}

							element.find('button').each
							(	function()
								{
									$(this).button('option', 'disabled', $(this).hasClass('zoomed') || $(this).hasClass('select') || $(this).hasClass('cliped'));
								}
							);

							defer.resolve();
						}
					);
				}).promise();
			},
			//#endregion
			//#region _createAuduoChannelEditor
			_createAuduoChannelEditor:				function(name)
			{
				let widget					= <Widget>this;
				let element					= widget.element;
				let audioChannelEditor		= $.eliza.audioChannelEditor();
				audioChannelEditor.title	= name;
				audioChannelEditor.element.on('selectionChanged', (event, ui) => widget._selectionChanged(ui));

				element.find('.display').append(audioChannelEditor.element);

				for(let i = 0; i < widget.audioChannelEditors.length; ++i)
				{
					let ace	= widget.audioChannelEditors[i];

					ace.link(audioChannelEditor);
					audioChannelEditor.link(ace);
				}

				widget.audioChannelEditors.push(audioChannelEditor);
				return audioChannelEditor;
			},
			//#endregion
			//#region _removeAllAudioChannelEditors
			_removeAllAudioChannelEditors:			function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				element.find('.display').empty();
				widget.audioChannelEditors	= [];
			},
			//#endregion
			//#region _saveAs
			_saveAs:								function()
			{
				let widget	= <Widget>this;
				let options	= widget.options;

				saveAs(new Blob([widget._toWave().encodeWaveFile(widget.originalSampleRate, widget.originalBitsPerSample)]), `${options.name}.wav`, true);
			},
			//#endregion
			//#region _open
			_open:									function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				element.find('[name=file]').trigger('click');
			},
			//#endregion
			//#region _toWave
			_toWave:								function()
			{
				let widget			= <Widget>this;
				let options			= widget.options;

				return new Wave
				(	widget.sampleRate,
					widget.originalBitsPerSample,
					_.map(widget.audioChannelEditors, (ace) => ace.audioChannel.data),
					$.extend(widget.originalTags, options.tags)
				);
			},
			//#endregion
			//#region _selectionChanged
			_selectionChanged:						function(info)
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				element.find('button.select').each( function() { $(this).button('option', 'disabled', !info.isSelected);	} );
				element.find('button.zoomed').each( function() { $(this).button('option', 'disabled', !info.isZoomed);		} );
				element.find('button.notall').each( function() { $(this).button('option', 'disabled', info.allSelected);	} );
				element.find('button.cliped').each( function() { $(this).button('option', 'disabled', !info.canPaste);		} );
			},
			//#endregion
			//#region zoomToSelection
			zoomToSelection:					function()
			{
				let widget	= <Widget>this;

				_.each(widget.audioChannelEditors, (ace) => ace.zoomToSelection());
			},
			//#endregion
			//#region zoomToFit
			zoomToFit:							function()
			{
				let widget	= <Widget>this;

				_.each(widget.audioChannelEditors, (ace) => ace.zoomToFit());
			},
			//#endregion
			//#region selectAll
			selectAll:								function()
			{
				let widget	= <Widget>this;

				_.each(widget.audioChannelEditors, (ace) => ace.selectAll());
			},
			//#endregion
			//#region selectNone
			selectNone:								function()
			{
				let widget	= <Widget>this;

				_.each(widget.audioChannelEditors, (ace) => ace.selectNone());
			},
			//#endregion
			//#region filterNormalize
			filterNormalize:					function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				widget.do
				(	function()
					{
						_.each(widget.audioChannelEditors, (ace) => ace.filterNormalize());
						element.trigger('update');
					}
				);
			},
			//#endregion
			//#region filterFadeIn
			filterFadeIn:						function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				widget.do
				(	function()
					{
						_.each(widget.audioChannelEditors, (ace) => ace.filterFade(true));
						element.trigger('update');
					}
				);
			},
			//#endregion
			//#region filterFadeOut
			filterFadeOut:						function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				widget.do
				(	function()
					{
						_.each(widget.audioChannelEditors, (ace) => ace.filterFade(false));
						element.trigger('update');
					}
				);
			},
			//#endregion
			//#region filterGain
			filterGain:							function(decibel)
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				widget.do
				(	function()
					{
						_.each(widget.audioChannelEditors, (ace) => ace.filterGain(decibel));
						element.trigger('update');
					}
				);
			},
			//#endregion
			//#region filterSilence
			filterSilence:						function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				_.each(widget.audioChannelEditors, (ace) => ace.filterSilence());
				element.trigger('update');
			},
			//#endregion
			//#region copy
			copy:								function()
			{
				let widget	= <Widget>this;

				_.each(widget.audioChannelEditors, (ace) => ace.copy());
			},
			//#endregion
			//#region paste
			paste:								function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				widget.do
				(	function()
					{
						_.each(widget.audioChannelEditors, (ace) => ace.paste());
						element.trigger('update');
					}
				);
			},
			//#endregion
			//#region cut
			cut:								function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				widget.do
				(	function()
					{
						_.each(widget.audioChannelEditors, (ace) => ace.cut());
						element.trigger('update');
					}
				);
			},
			//#endregion
			//#region del
			del:								function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				widget.do
				(	function()
					{
						_.each(widget.audioChannelEditors, (ace) => ace.del());
						element.trigger('update');
					}
				);
			},
			//#endregion
			//#region crop
			crop:								function()
			{
				let widget	= <Widget>this;
				let element	= widget.element;

				widget.do
				(	function()
					{
						_.each(widget.audioChannelEditors, (ace) => ace.crop());
						element.trigger('update');
					}
				);
			},
			//#endregion
			//#region playToggle
			playToggle:							function()
			{
				let widget	= <Widget>this;

				if(AudioPlayback.isPlaying)
					widget.stop();
				else
					widget.play();
			},
			//#endregion
			//#region play
			play:								function()
			{
				let widget	= <Widget>this;

				let audioData		= _.map(widget.audioChannelEditors, (ace) => ace.audioChannel.data);
				let selectionStart	= widget.audioChannelEditors[0].selectionStart;
				let selectionEnd	= widget.audioChannelEditors[0].selectionEnd;
				let sampleRate		= widget.audioChannelEditors[0].audioChannel.sampleRate;
				let channels		= widget.audioChannelEditors.length;

				if(selectionStart != selectionEnd)
				{
					AudioPlayback.play
					(
						{
							audioData:		audioData,
							sampleRate:		sampleRate,
							channels:		channels,
							isLooped:		widget.playLoop,
							start:			selectionStart,
							end:			selectionEnd,
							onPlayback:		(pos: number) => widget._onAudioPlayback(pos),
							onAnalysis:		(ana: AnalyserNode) => widget._onAudioAnalysis(ana),
						}
					);
				}
				else
				{
					AudioPlayback.play
					(
						{
							audioData:		audioData,
							sampleRate:		sampleRate,
							channels:		channels,
							isLooped:		widget.playLoop,
							onPlayback:		(pos: number) => widget._onAudioPlayback(pos),
							onAnalysis:		(ana: AnalyserNode) => widget._onAudioAnalysis(ana),
						}
					);
				}
			},
			//#endregion
			//#region stop
			stop:								function()
			{
				let widget	= <Widget>this;

				AudioPlayback.stop();
			},
			//#endregion
			//#region toggleLoop
			toggleLoop:							function()
			{
				let widget	= <Widget>this;

				widget.playLoop	= !widget.playLoop;
			},
			//#endregion
			//#region override(undoable) setValue
			setValue:						function(file: ArrayBuffer)
			{
				let widget	= <Widget>this;

				widget._fileLoaded(file);
			},
			//#endregion
			//#region override(undoable) getValue
			getValue:						function()
			{
				let widget	= <Widget>this;
				let options	= widget.options;

				return widget._toWave().encodeWaveFile(widget.originalSampleRate, widget.originalBitsPerSample).buffer;
			},
			//#endregion
		}
	);
}

interface JQueryElizaNamespace
{
	audioEditor(options?: Widget.AudioEditor.Options, element?: JQuery): Widget.AudioEditor.Widget;
}

interface JQuery
{
	audioEditor(...args: any[]):		any;
}

