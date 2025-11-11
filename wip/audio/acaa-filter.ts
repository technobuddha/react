////////////////////////////////////////////////////////////////////////////////
///
/// FIR low-pass (anti-alias) filter with filter coefficient design routine and
/// MMX optimization.
///
/// Anti-alias filter is used to prevent folding of high frequencies when
/// transposing the sample rate with interpolation.
///
/// Author        : Copyright (c) Olli Parviainen
/// Author e-mail : oparviai 'at' iki.fi
/// SoundTouch WWW: http://www.surina.net/soundtouch
///
////////////////////////////////////////////////////////////////////////////////
//
// Last changed  : $Date: 2006-09-18 22:29:22 $
// File revision : $Revision: 1.4 $
//
// $Id: AAFilter.cpp,v 1.4 2006-09-18 22:29:22 martynshaw Exp $
//
////////////////////////////////////////////////////////////////////////////////
//
// License :
//
//  SoundTouch audio processing library
//  Copyright (c) Olli Parviainen
//
//  This library is free software; you can redistribute it and/or
//  modify it under the terms of the GNU Lesser General Public
//  License as published by the Free Software Foundation; either
//  version 2.1 of the License, or (at your option) any later version.
//
//  This library is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
//  Lesser General Public License for more details.
//
//  You should have received a copy of the GNU Lesser General Public
//  License along with this library; if not, write to the Free Software
//  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
//
////////////////////////////////////////////////////////////////////////////////

class ACAAFilter
{
	constructor(length: number = 32)
	{
		this.pFIR		= new ACFIRFilter();
		this.cutoffFreq	= 0.9;

		this.setLength(length);
	}

	public		pFIR:			ACFIRFilter;
	public		cutoffFreq:		number;
	public		length:			number;

	public		setCutoffFreq(newCutoffFreq: number)
	{
		this.cutoffFreq		= newCutoffFreq;
		this.calculateCoeffs();
	};

	public		setLength(newLength: number)
	{
		this.length			= newLength;
		this.calculateCoeffs();
	};

	public		calculateCoeffs()
	{
		if(this.length <= 0 || this.length % 4 != 0 || this.cutoffFreq < 0 || this.cutoffFreq > 1.5) debugger;

		let work		= new Float32Array(this.length);
		let coeffs		= new Float32Array(this.length);
		let fc2			= 2.0 * this.cutoffFreq;
		let wc			= Math.PI * fc2;
		let tempCoeff	= Math.PI * 2 / this.length;
		let sum			= 0;

		for(let i = 0; i < this.length; ++i)
		{
			let cntTemp = i - (this.length / 2);
			let temp	= cntTemp * wc;
			let h		= temp === 0 ? 1.0 : fc2 * Math.sin(temp) / temp;	// sinc function
			let w		= 0.54 + 0.46 * Math.cos(tempCoeff * cntTemp);		// hamming window
			temp		= w * h;
			work[i]		= temp;

			// calc net sum of coefficients
			sum			+= temp;
		}

		// Calculate a scaling coefficient in such a way that the result can be
		// divided by 16384
		let scaleCoeff	= 16384.0 / sum;

		for(let i = 0; i < this.length; ++i)
		{
			// scale & round to nearest integer
			let temp	=  work[i] * scaleCoeff;
			temp		+= (temp >= 0) ? 0.5 : -0.5;

			// ensure no overfloods
			if(temp < -32768 || temp > 32767) debugger;
			coeffs[i] = temp;
		}

		// Set coefficients. Use divide factor 14 => divide result by 2^14 = 16384
		this.pFIR.setCoefficients(coeffs, this.length, 14);
	}

	public		evaluate(dest, src, numSamples)
	{
		return this.pFIR.evaluateFilter(dest, src, numSamples);
	};

	public		getLength()
	{
		return this.pFIR.getLength();
	};
}

